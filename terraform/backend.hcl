bucket = "datanate-terraform-state"
key    = "terraform.tfstate"
region = "APAC"

# Replace YOUR_ACCOUNT_ID with your actual Cloudflare account ID
endpoints = {
  s3 = "https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"
}

skip_credentials_validation = true
skip_region_validation      = true
skip_requesting_account_id  = true
skip_metadata_api_check     = true
skip_s3_checksum           = true
