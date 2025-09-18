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

# Cloudflare Pages project (direct upload, no git integration)
resource "cloudflare_pages_project" "datanate_dashboard" {
  account_id        = var.cloudflare_account_id
  name             = "datanate-dashboard"
  production_branch = "main"

  # No build config or source - using direct upload via wrangler
}

# Custom domain
resource "cloudflare_pages_domain" "datanate_dashboard" {
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

# Worker route to apply auth to the custom domain
resource "cloudflare_worker_route" "auth_route" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "${var.custom_domain}/*"
  script_name = cloudflare_worker_script.auth_worker.name
}

# DNS record for custom domain
resource "cloudflare_record" "pages_cname" {
  zone_id = var.cloudflare_zone_id
  name    = var.custom_domain
  value   = cloudflare_pages_project.datanate_dashboard.subdomain
  type    = "CNAME"
  proxied = true
}