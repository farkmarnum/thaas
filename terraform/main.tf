###
### TLS cert that will work for both frontend and backend domains
###
module "acm_request_certificate" {
  source  = "cloudposse/acm-request-certificate/aws"
  version = "0.16.0"

  domain_name                       = var.domain
  subject_alternative_names         = ["*.${var.domain}"]
  process_domain_validation_options = true
  ttl                               = "300"
}

###
### FRONTEND
###
module "frontend" {
  source = "./frontend"

  domain                      = var.domain
  hosted_zone_name            = "${var.domain}."
  acm_request_certificate_arn = module.acm_request_certificate.arn

  tags = var.tags
}

###
### BACKEND
###
module "backend" {
  source = "./backend"

  domain                      = "api.${var.domain}"
  images_domain               = "images.${var.domain}"
  name                        = var.service
  hosted_zone_name            = "${var.domain}."
  acm_request_certificate_arn = module.acm_request_certificate.arn

  SLACK_CLIENT_ID       = var.SLACK_CLIENT_ID
  SLACK_CLIENT_SECRET   = var.SLACK_CLIENT_SECRET
  SLACK_STATE_SECRET    = var.SLACK_STATE_SECRET
  alarm_email           = var.alarm_email
  GH_APP_APP_ID         = var.GH_APP_APP_ID
  GH_APP_PRIVATE_KEY    = var.GH_APP_PRIVATE_KEY
  GH_APP_WEBHOOK_SECRET = var.GH_APP_WEBHOOK_SECRET

  tags = var.tags
}
