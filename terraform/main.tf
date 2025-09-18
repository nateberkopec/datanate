terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Cloudflare Pages project
resource "cloudflare_pages_project" "datanate_dashboard" {
  account_id        = var.cloudflare_account_id
  name             = "datanate-dashboard"
  production_branch = "main"

  build_config {
    build_command   = "mise build"
    destination_dir = "dist"
  }

  source {
    type = "github"
    config {
      owner                         = var.github_username
      repo_name                    = var.github_repo_name
      production_branch            = "main"
      pr_comments_enabled          = false
      deployments_enabled          = true
      production_deployment_enabled = true
    }
  }
}

# Custom domain (optional)
resource "cloudflare_pages_domain" "datanate_dashboard" {
  count      = var.custom_domain != "" ? 1 : 0
  account_id = var.cloudflare_account_id
  project_name = cloudflare_pages_project.datanate_dashboard.name
  domain     = var.custom_domain
}

# Cloudflare Worker for HTTP Basic Auth
resource "cloudflare_worker_script" "auth_worker" {
  account_id = var.cloudflare_account_id
  name       = "datanate-auth"
  content    = file("${path.module}/auth-worker.js")

  secret_text_binding {
    name = "AUTH_USERNAME"
    text = var.auth_username
  }

  secret_text_binding {
    name = "AUTH_PASSWORD"
    text = var.auth_password
  }
}

# Worker route to apply auth to the pages site
resource "cloudflare_worker_route" "auth_route" {
  zone_id     = var.cloudflare_zone_id
  pattern     = var.custom_domain != "" ? "${var.custom_domain}/*" : "${cloudflare_pages_project.datanate_dashboard.subdomain}/*"
  script_name = cloudflare_worker_script.auth_worker.name
}

# Zone settings for the custom domain (if used)
resource "cloudflare_zone" "main" {
  count = var.custom_domain != "" ? 1 : 0
  zone  = var.custom_domain
}

# DNS record for custom domain (if used)
resource "cloudflare_record" "pages_cname" {
  count   = var.custom_domain != "" ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = var.custom_domain
  value   = cloudflare_pages_project.datanate_dashboard.subdomain
  type    = "CNAME"
  proxied = true
}