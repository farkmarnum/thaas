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

variable "alarm_email" {
  type = string
}

variable "GH_APP_APP_ID" {
  type = string
}

variable "GH_APP_PRIVATE_KEY" {
  type = string
}

variable "GH_APP_WEBHOOK_SECRET" {
  type = string
}

variable "tags" {
  type = map(string)
}
