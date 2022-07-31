locals {
  source_dir = "${path.module}/../../backend"
}

###
### S3 BUCKET
###
module "s3_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"
  version = "3.0.1"

  bucket = "${var.name}-storage"
  acl    = "private"
}

module "cloudfront" {
  source = "./cloudfront"

  domain             = var.images_domain
  bucket_domain_name = module.s3_bucket.s3_bucket_bucket_domain_name
  certificate_arn    = var.acm_request_certificate_arn
  hosted_zone_name   = var.hosted_zone_name

  tags = var.tags
}

###
### LAMBDA
###
module "lambda_function" {
  source = "terraform-aws-modules/lambda/aws"
  version = "2.36.0"

  function_name = var.name
  handler       = "handler.handler"
  runtime       = "nodejs16.x"
  source_path   = local.source_dir

  publish = true

  environment_variables = {
    S3_BUCKET_NAME = module.s3_bucket.s3_bucket_id
    IMAGES_DOMAIN  = var.images_domain
  }

  # Allow Lambda to access S3:
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
