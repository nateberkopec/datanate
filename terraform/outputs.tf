output "pages_url" {
  description = "URL of the Cloudflare Pages deployment"
  value       = "https://${cloudflare_pages_project.datanate_dashboard.subdomain}"
}

output "custom_domain_url" {
  description = "URL of the custom domain (if configured)"
  value       = var.custom_domain != "" ? "https://${var.custom_domain}" : null
}

output "worker_script_name" {
  description = "Name of the auth worker script"
  value       = cloudflare_worker_script.auth_worker.name
}