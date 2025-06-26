terraform {
  required_providers {
    railway = {
      source = "terraform-community-providers/railway"
      version = "0.5.2"
    }
  }
}

provider "railway" {
    token = var.token
}