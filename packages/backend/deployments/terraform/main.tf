resource "aws_iam_role" "iam_for_lambda" {
  name = "${var.prefix}-iam_for_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_s3_bucket" "images" {
  bucket = "${var.prefix}-images"

  acl           = "private"
  force_destroy = true
}

resource "aws_lambda_function" "main" {
  filename      = "dist/main.zip"
  function_name = "${local.prefix}-main"
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "main.handler"
  source_code_hash = filebase64sha256("dist/main.zip")

  runtime = "nodejs16.x"

  environment {
    variables = {
      images_bucket = aws_s3_bucket.images.name
    }
  }
}
