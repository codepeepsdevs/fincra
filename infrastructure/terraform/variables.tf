variable "token" {
    type  = string
    description = "Railway API token"
}

variable "project_name" {
    type = string
    description = "Project name"
    default = "fincra"
}

variable "env" {
    type = string
    description = "Environment name"
    default = "prod"
}

variable "repo_url" {
    type = string
    description = "Repository URL"
}

variable "repo_branch" {
    type = string
    description = "Repository branch"
    default = "main"
}
 

variable "frontend_env" {
    type = map(string)
    description = "Frontend environment"
    default = {
        NEXT_PUBLIC_API_URL = "https://api.fincra.com"
    }
}

variable "backend_env" {
    type = map(string)
    description = "Backend environment"
    default = {
        SENTRY_KEY = "1234567890"
    }
}