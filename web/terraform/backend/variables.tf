variable "domain" {
  type = string
}

variable "acm_request_certificate_arn" {
  type = string
}

variable "name" {
  type = string
}

variable "tags" {
  type = map(string)
}
