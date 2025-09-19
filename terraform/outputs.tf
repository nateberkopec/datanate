output "dashboard_url" {
  description = "URL of the dashboard on your custom domain"
  value       = "https://${var.custom_domain}"
}

output "pages_subdomain" {
  description = "Cloudflare Pages subdomain (for reference)"
  value       = cloudflare_pages_project.datanate_dashboard.subdomain
}

output "access_custom_domain" {
  description = "Cloudflare Access application for custom domain"
  value       = cloudflare_access_application.datanate_dashboard_custom.domain
}

output "access_pages_domain" {
  description = "Cloudflare Access application for pages.dev domain"
  value       = cloudflare_access_application.datanate_dashboard_pages.domain
}