variable "cloudflare_api_token" {
  description = "Cloudflare API Token with Pages:Edit, Workers:Edit, Zone:Edit permissions"
  type        = string
  sensitive   = true
  default     = env("TF_VAR_cloudflare_api_token")
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
  default     = env("TF_VAR_cloudflare_account_id")
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for your custom domain"
  type        = string
  default     = env("TF_VAR_cloudflare_zone_id")
}

# GitHub variables removed - no longer needed for direct upload

variable "custom_domain" {
  description = "Custom domain for the dashboard (required)"
  type        = string
  default     = env("TF_VAR_custom_domain")
}

variable "auth_username" {
  description = "HTTP Basic Auth username"
  type        = string
  default     = env("TF_VAR_auth_username")
}

variable "auth_password" {
  description = "HTTP Basic Auth password"
  type        = string
  sensitive   = true
  default     = env("TF_VAR_auth_password")
}