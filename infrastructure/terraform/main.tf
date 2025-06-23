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
resource "railway_service" "backend" {
  name       = "backend"
  project_id = railway_project.fincra.id
  source_repo  = var.repo_url
  root_directory = "backend"
  config_path = "backend/railway.json"
  source_repo_branch  = var.repo_branch
}


resource "railway_service" "frontend" {
  name       = "frontend"
  project_id = railway_project.fincra.id
  source_repo  = var.repo_url
  root_directory = "frontend"
  config_path = "frontend/railway.json"
  source_repo_branch  = var.repo_branch

}