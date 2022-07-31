locals {
  s3_origin_id = "s3"
}

data "aws_cloudfront_origin_request_policy" "this" {
  name = "Managed-CORS-S3Origin"
}

data "aws_cloudfront_cache_policy" "this" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
  comment = "Origin Access Identity for S3"
}

resource "aws_cloudfront_distribution" "images" {
  enabled = true
  default_root_object = "index.html"

  origin {
    domain_name = var.bucket_domain_name
    origin_id   = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = var.cloudfront_access_identity_path
    }
  }

  viewer_certificate {
    acm_certificate_arn            = var.certificate_arn
    cloudfront_default_certificate = false
    minimum_protocol_version       = "TLSv1.2_2019"
    ssl_support_method             = "sni-only"
  }

  # Route53 requires Alias/CNAME to be setup
  aliases = [var.domain]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.s3_origin_id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.this.id
    cache_policy_id          = data.aws_cloudfront_cache_policy.this.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = var.tags
}

data "aws_route53_zone" "primary" {
  name = var.hosted_zone_name
}

resource "aws_route53_record" "subdomain" {
  zone_id = "${data.aws_route53_zone.primary.zone_id}"
  name    = var.domain
  type    = "A"

  alias {
    name = "${aws_cloudfront_distribution.images.domain_name}"
    zone_id = "Z2FDTNDATAQYW2" # CloudFront ZoneID (https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-route53-aliastarget.html)
    evaluate_target_health = false
  }
}
