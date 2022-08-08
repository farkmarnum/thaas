data "aws_caller_identity" "current" {}

locals {
  source_dir = "${path.module}/../web/backend"
  s3_bucket_name = "${var.name}-storage"
  aws_account_id = data.aws_caller_identity.current.account_id
  ssm_prefix = "/${var.name}"
}

resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
  comment = "Origin Access Identity for S3"
}

###
### S3 BUCKET
###
module "s3_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"
  version = "3.0.1"

  bucket = local.s3_bucket_name
  acl    = "private"

  attach_policy = true
  policy = <<EOF
{
  "Id": "bucket_policy_site",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "bucket_policy_site_root",
      "Action": ["s3:ListBucket"],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::${local.s3_bucket_name}",
      "Principal": {"AWS":"${aws_cloudfront_origin_access_identity.origin_access_identity.iam_arn}"}
    },
    {
      "Sid": "bucket_policy_site_all",
      "Action": ["s3:GetObject"],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::${local.s3_bucket_name}/*",
      "Principal": {"AWS":"${aws_cloudfront_origin_access_identity.origin_access_identity.iam_arn}"}
    }
  ]
}
EOF

  tags = var.tags
}

module "cloudfront" {
  source = "./cloudfront"

  domain                          = var.images_domain
  bucket_domain_name              = module.s3_bucket.s3_bucket_bucket_domain_name
  certificate_arn                 = var.acm_request_certificate_arn
  hosted_zone_name                = var.hosted_zone_name
  cloudfront_access_identity_path = aws_cloudfront_origin_access_identity.origin_access_identity.cloudfront_access_identity_path

  tags = var.tags
}

###
### 
###
module "lambda_function" {
  source = "terraform-aws-modules/lambda/aws"
  version = "2.36.0"

  function_name = var.name
  handler       = "handler.handler"
  runtime       = "nodejs16.x"
  source_path   = local.source_dir

  publish = true

  # Limit the concurrency to prevent an accidental recursion bug from emptying my bank account:
  reserved_concurrent_executions = 20

  environment_variables = {
    S3_BUCKET_NAME      = module.s3_bucket.s3_bucket_id
    IMAGES_DOMAIN       = var.images_domain
    BACKEND_DOMAIN      = var.domain
    SLACK_CLIENT_ID     = var.SLACK_CLIENT_ID
    SLACK_CLIENT_SECRET = var.SLACK_CLIENT_SECRET
    SLACK_STATE_SECRET  = var.SLACK_STATE_SECRET
    SSM_PREFIX          = local.ssm_prefix
  }

  # Allow Lambda to access S3 and SSM Parameter Store:
  attach_policy_json = true
  policy_json        = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetObject",
                "s3:GetObjectVersion"
            ],
            "Resource": [
                "${module.s3_bucket.s3_bucket_arn}",
                "${module.s3_bucket.s3_bucket_arn}/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "ssm:PutParameter",
                "ssm:DeleteParameter",
                "ssm:GetParameterHistory",
                "ssm:GetParametersByPath",
                "ssm:GetParameters",
                "ssm:GetParameter",
                "ssm:DeleteParameters"
            ],
            "Resource": "arn:aws:ssm:*:${local.aws_account_id}:parameter${local.ssm_prefix}/*"
        },
        {
            "Effect": "Allow",
            "Action": "ssm:DescribeParameters",
            "Resource": "*"
        }
    ]
}
EOF

  # Allow API Gateway to invoke Lambda:
  allowed_triggers = {
    AllowExecutionFromAPIGateway = {
      service    = "apigateway"
      source_arn = "${module.api_gateway.apigatewayv2_api_execution_arn}/*/*"
    }
  }

  tags = var.tags
}

###
### API GATEWAY
###
module "api_gateway" {
  source = "terraform-aws-modules/apigateway-v2/aws"
  version = "1.8.0"

  name          = var.domain
  protocol_type = "HTTP"

  domain_name                 = var.domain
  domain_name_certificate_arn = var.acm_request_certificate_arn

  integrations = {
    "ANY /{path+}" = {
      lambda_arn             = module.lambda_function.lambda_function_arn
      payload_format_version = "2.0"
      timeout_milliseconds   = 5000
    }

    "$default" = {
      lambda_arn = module.lambda_function.lambda_function_arn
    }
  }

  create_vpc_link = false

  tags = var.tags
}

###
### ROUTE 53 (DNS)
###
data "aws_route53_zone" "primary" {
  name = var.hosted_zone_name
}

resource "aws_route53_record" "subdomain" {
  zone_id = "${data.aws_route53_zone.primary.zone_id}"
  name    = var.domain
  type    = "A"

  alias {
    name = module.api_gateway.apigatewayv2_domain_name_target_domain_name
    zone_id = module.api_gateway.apigatewayv2_domain_name_hosted_zone_id
    evaluate_target_health = false
  }
}

###
### CloudWatch Alarm
###
resource "aws_sns_topic" "lambda_invocations_alarm" {
  name            = "lambda-invocations-${var.name}"
  delivery_policy = jsonencode({
    "http" : {
      "defaultHealthyRetryPolicy" : {
        "minDelayTarget" : 20,
        "maxDelayTarget" : 20,
        "numRetries" : 3,
        "numMaxDelayRetries" : 0,
        "numNoDelayRetries" : 0,
        "numMinDelayRetries" : 0,
        "backoffFunction" : "linear"
      },
      "disableSubscriptionOverrides" : false,
      "defaultThrottlePolicy" : {
        "maxReceivesPerSecond" : 1
      }
    }
  })
}
resource "aws_sns_topic_subscription" "topic_email_subscription" {
  topic_arn = aws_sns_topic.lambda_invocations_alarm.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}
locals {
  lambda_invocations_threshold = 10
  lambda_invocations_period_seconds = 60
}
module "metric_alarms" {
  source  = "terraform-aws-modules/cloudwatch/aws//modules/metric-alarm"
  version = "~> 3.0"

  alarm_name          = "lambda-invocations-${var.name}"
  alarm_description   = "Too many lambda invocations (more than ${local.lambda_invocations_threshold} times in ${local.lambda_invocations_period_seconds} seconds)."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = local.lambda_invocations_threshold
  period              = local.lambda_invocations_period_seconds
  unit                = "Count"

  namespace   = "AWS/Lambda"
  metric_name = "Invocations"
  statistic   = "Maximum"

  dimensions = {
    FunctionName = module.lambda_function.lambda_function_name
  }

  alarm_actions = [resource.aws_sns_topic.lambda_invocations_alarm.arn]
}
