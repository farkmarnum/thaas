variable "domain" {
  type = string
}

variable "bucket_domain_name" {
  type = string
}

variable "hosted_zone_name" {
  type = string
}

variable "certificate_arn" {
  type = string
}

variable "cloudfront_access_identity_path" {
  type = string
}

variable "tags" {
  type = map(string)
}
