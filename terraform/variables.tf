variable "cloudflare_api_token" {
  description = "Cloudflare API Token with Pages:Edit, Workers:Edit, Zone:Edit permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for your custom domain"
  type        = string
}

# GitHub variables removed - no longer needed for direct upload

variable "custom_domain" {
  description = "Custom domain for the dashboard (required)"
  type        = string
}

variable "auth_username" {
  description = "HTTP Basic Auth username"
  type        = string
}

variable "auth_password" {
  description = "HTTP Basic Auth password"
  type        = string
  sensitive   = true
}

variable "r2_access_key_id" {
  description = "Cloudflare R2 Access Key ID"
  type        = string
  sensitive   = true
}

variable "r2_secret_access_key" {
  description = "Cloudflare R2 Secret Access Key"
  type        = string
  sensitive   = true
}

variable "r2_location" {
  description = "Cloudflare R2 bucket location"
  type        = string
  default     = "WNAM"
}