output "dashboard_url" {
  description = "URL of the dashboard on your custom domain"
  value       = "https://${var.custom_domain}"
}

output "pages_subdomain" {
  description = "Cloudflare Pages subdomain (for reference)"
  value       = cloudflare_pages_project.datanate_dashboard.subdomain
}

output "worker_script_name" {
  description = "Name of the auth worker script"
  value       = cloudflare_worker_script.auth_worker.name
}