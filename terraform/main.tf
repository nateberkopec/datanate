terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  backend "s3" {}
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}


# Cloudflare Pages project (direct upload, no git integration)
resource "cloudflare_pages_project" "datanate_dashboard" {
  account_id        = var.cloudflare_account_id
  name             = var.project_name
  production_branch = "main"

  # No build config or source - using direct upload via wrangler
}

# Custom domain
resource "cloudflare_pages_domain" "datanate_dashboard" {
  account_id = var.cloudflare_account_id
  project_name = cloudflare_pages_project.datanate_dashboard.name
  domain     = var.custom_domain
}

# Cloudflare Zero Trust Access application for custom domain
resource "cloudflare_zero_trust_access_application" "datanate_dashboard_custom" {
  zone_id          = var.cloudflare_zone_id
  name             = "${title(replace(var.project_name, "-", " "))} (Custom Domain)"
  domain           = var.custom_domain
  type             = "self_hosted"
  session_duration = "720h"
}

# Cloudflare Zero Trust Access application for pages.dev main domain
resource "cloudflare_zero_trust_access_application" "datanate_dashboard_pages_main" {
  account_id       = var.cloudflare_account_id
  name             = "${title(replace(var.project_name, "-", " "))} (Pages Main)"
  domain           = "${var.project_name}.pages.dev"
  type             = "self_hosted"
  session_duration = "720h"
}

# Cloudflare Zero Trust Access application for all pages.dev deployment URLs
resource "cloudflare_zero_trust_access_application" "datanate_dashboard_deployments" {
  account_id       = var.cloudflare_account_id
  name             = "${title(replace(var.project_name, "-", " "))} (All Deployments)"
  domain           = "*.${var.project_name}.pages.dev"
  type             = "self_hosted"
  session_duration = "720h"
}

# Zero Trust Access policy for custom domain
resource "cloudflare_zero_trust_access_policy" "datanate_dashboard_custom_policy" {
  application_id = cloudflare_zero_trust_access_application.datanate_dashboard_custom.id
  zone_id        = var.cloudflare_zone_id
  name           = "Allow Access"
  precedence     = 1
  decision       = "allow"

  include {
    email = [var.access_email]
  }
}

# Zero Trust Access policy for pages.dev main domain
resource "cloudflare_zero_trust_access_policy" "datanate_dashboard_pages_main_policy" {
  application_id = cloudflare_zero_trust_access_application.datanate_dashboard_pages_main.id
  account_id     = var.cloudflare_account_id
  name           = "Allow Access"
  precedence     = 1
  decision       = "allow"

  include {
    email = [var.access_email]
  }
}

# Zero Trust Access policy for all deployment URLs
resource "cloudflare_zero_trust_access_policy" "datanate_dashboard_deployments_policy" {
  application_id = cloudflare_zero_trust_access_application.datanate_dashboard_deployments.id
  account_id     = var.cloudflare_account_id
  name           = "Allow Access"
  precedence     = 1
  decision       = "allow"

  include {
    email = [var.access_email]
  }
}

# DNS record for custom domain
resource "cloudflare_record" "pages_cname" {
  zone_id = var.cloudflare_zone_id
  name    = var.custom_domain
  content = cloudflare_pages_project.datanate_dashboard.subdomain
  type    = "CNAME"
  proxied = true
}