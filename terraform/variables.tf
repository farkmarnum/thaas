variable "domain" {
  type = string
}

variable "service" {
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

variable "tags" {
  type = map(string)

  default = {
    Terraform = true
  }
}
