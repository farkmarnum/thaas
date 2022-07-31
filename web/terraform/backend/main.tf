locals {
  source_dir = "${path.module}/../../../backend"
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

  policy_json = <<EOF
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "S3ReadOnly",
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

  attach_policy_json = true

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
    "$default" = {
      lambda_arn = module.lambda_function.lambda_function_arn
    }
  }

  create_vpc_link = false

  tags = var.tags
}
