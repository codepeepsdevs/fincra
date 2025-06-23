############################
# PROJECT
############################
resource "railway_project" "fincra" {
  name = var.project_name
}


############################
# ENVIRONMENT
############################
resource "railway_environment" "fincra" {
  name       = "${var.env}-${var.project_name}"
  project_id = railway_project.fincra.id
}

############################
# SERVICES
############################
# resource "railway_service" "backend" {
#   name       = "backend"
#   project_id = railway_project.fincra.id
#   source_repo  = var.repo_url
#   root_directory = "backend"
#   config_path = "backend/railway.json"
#   source_repo_branch  = var.repo_branch
# }


# resource "railway_service" "frontend" {
#   name       = "frontend"
#   project_id = railway_project.fincra.id
#   source_repo  = var.repo_url
#   root_directory = "frontend"
#   config_path = "frontend/railway.json"
#   source_repo_branch  = var.repo_branch


#   depends_on = [railway_service.backend]
# }

resource "null_resource" "backend_service" {
  provisioner "local-exec" {
    command = <<-EOT
      railway login --browser
      railway link ${railway_project.fincra.id}
      railway service create backend
      railway service connect repo ${var.repo_url} --branch ${var.repo_branch} --root backend
    EOT
  }
  
}


resource "null_resource" "frontend_service" {
  provisioner "local-exec" {
    command = <<-EOT
      railway service create frontend
      railway service connect repo ${var.repo_url} --branch ${var.repo_branch} --root frontend
    EOT
  }
  
}

# ############################
# # VARIABLES
# ############################
# resource "railway_variable" "backend_env" {
#   for_each       = var.backend_env
#   name           = each.key
#   value          = each.value
#   environment_id = railway_project.fincra.default_environment.id
#   service_id     = railway_service.backend.id
# }


# resource "railway_variable" "frontend_env" {
#   for_each       = var.frontend_env
#   name           = each.key
#   value          = each.value
#   environment_id = railway_project.fincra.default_environment.id
#   service_id     = railway_service.frontend.id
# }
