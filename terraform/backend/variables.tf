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
  type      = string
  sensitive = true
}

variable "SLACK_CLIENT_SECRET" {
  type      = string
  sensitive = true
}

variable "SLACK_STATE_SECRET" {
  type      = string
  sensitive = true
}

variable "alarm_email" {
  type      = string
  sensitive = true
}

variable "GH_APP_APP_ID" {
  type      = string
  sensitive = true
}

variable "GH_APP_PRIVATE_KEY" {
  type      = string
  sensitive = true
}

variable "GH_APP_WEBHOOK_SECRET" {
  type      = string
  sensitive = true
}

variable "tags" {
  type = map(string)
}
