output "dashboard_url" {
  description = "URL of the dashboard on your custom domain"
  value       = "https://${var.custom_domain}"
}

output "pages_subdomain" {
  description = "Cloudflare Pages subdomain (for reference)"
  value       = cloudflare_pages_project.datanate_dashboard.subdomain
}

output "access_custom_domain" {
  description = "Cloudflare Zero Trust Access application for custom domain"
  value       = cloudflare_zero_trust_access_application.datanate_dashboard_custom.domain
}

output "access_deployments_domain" {
  description = "Cloudflare Zero Trust Access application for all deployment URLs"
  value       = cloudflare_zero_trust_access_application.datanate_dashboard_deployments.domain
}