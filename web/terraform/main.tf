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

  tags = var.tags
}
