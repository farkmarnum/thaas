variable "domain" {
  type = string
}

variable "images_domain" {
  type = string
}

variable "acm_request_certificate_arn" {
  type = string
}

variable "hosted_zone_name" {
  type = string
}

variable "name" {
  type = string
}

variable "SLACK_CLIENT_ID" {
  type = string
}

variable "SLACK_CLIENT_SECRET" {
  type = string
}

variable "SLACK_STATE_SECRET" {
  type = string
}

variable "tags" {
  type = map(string)
}
