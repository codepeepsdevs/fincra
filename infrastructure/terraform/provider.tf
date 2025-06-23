terraform {
  required_providers {
    railway = {
      source = "terraform-community-providers/railway"
      version = "0.5.2"
    }

    null = {
      source = "hashicorp/null"
      version = "3.2.4"
    }
  }
}

provider "railway" {
    token = var.token
}