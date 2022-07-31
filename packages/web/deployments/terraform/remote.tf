provider "aws" {
  region = "us-east-1"
}

terraform {
  cloud {
    organization = "farkmarnum"

    workspaces {
      name = "thaas"
    }
  }
}
