variable "domain" {
  type = string
}

variable "service" {
  type = string
}

variable "tags" {
  type = map(string)

  default = {
    Terraform = true
  }
}
