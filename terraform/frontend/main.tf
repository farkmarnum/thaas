locals {
  source_dir = "${path.module}/../../web/frontend"
}

data "aws_route53_zone" "for_domain" {
  name = var.hosted_zone_name
}

module "cdn" {
  source  = "cloudposse/cloudfront-s3-cdn/aws"
  version = "0.82.4"

  name    = "${var.domain}-frontend"
  aliases = [var.domain]

  dns_alias_enabled = true
  parent_zone_id    = data.aws_route53_zone.for_domain.zone_id

  website_enabled = true
  index_document  = "index.html"
  error_document  = "index.html"

  s3_website_password_enabled = true
  allow_ssl_requests_only     = false

  acm_certificate_arn = var.acm_request_certificate_arn

  tags = var.tags
}

resource "null_resource" "build_and_upload" {
  provisioner "local-exec" {
    command = <<-EOF
      set -eux

      yarn install
      yarn build

      aws s3 sync ./dist s3://$S3_BUCKET --delete --acl public-read
      aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION --paths "/robots.txt" "/favicon.ico" "/index.html" "/logo192.png" "/logo512.png" "/manifest.json"
    EOF

    working_dir = local.source_dir

    environment = {
      CLOUDFRONT_DISTRIBUTION = module.cdn.cf_id
      S3_BUCKET               = module.cdn.s3_bucket
    }
  }

  triggers = {
    source_code_checksum     = sha1(join("", [for f in fileset(local.source_dir, "**"): filesha1("${local.source_dir}/${f}") if length(regexall("node_modules/|build/|.DS_Store", f)) == 0]))

    CLOUDFRONT_DISTRIBUTION = module.cdn.cf_id
    S3_BUCKET               = module.cdn.s3_bucket
  }
}
