variable "aws_region" {
  type = string
  default = "us-east-1"
}

variable "prefix" {
  type = string
  description = "All resources will be prefixed with this name, to avoid naming collisions on AWS"
  default = "thaas"
}
