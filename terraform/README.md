# Terraform Infrastructure for Datanate Dashboard

This Terraform configuration sets up the complete infrastructure for automatically deploying your Datanate dashboard to Cloudflare Pages with HTTP Basic Auth protection.

## Architecture

- **Cloudflare Pages**: Hosts the static dashboard
- **Cloudflare Worker**: Provides HTTP Basic Auth protection
- **GitHub Actions**: Builds and deploys hourly + on commits

## Prerequisites

1. **Cloudflare Account** with Pages and Workers enabled
2. **GitHub Repository** for your datanate project
3. **Terraform** installed locally

## Setup

1. **Copy environment configuration:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your values** in `.env`:
   - Get Cloudflare API token from: Dashboard > My Profile > API Tokens
   - Get Account ID from: Dashboard > Right sidebar
   - Get Zone ID from: Dashboard > Your Domain > Right sidebar

3. **Initialize and apply using mise:**
   ```bash
   mise tf-init
   mise tf-plan
   mise tf-apply
   ```

4. **Set GitHub Secrets** (for the GitHub Action):
   - `CLOUDFLARE_API_TOKEN`: Same token from .env
   - `CLOUDFLARE_ACCOUNT_ID`: Same account ID from .env  
   - `SUBMODULE_TOKEN`: GitHub token with repo access (if using private submodules)

## Configuration

### Custom Domain (Optional)
To use a custom domain, set `TF_VAR_custom_domain` in .env and ensure the domain is added to your Cloudflare account.

### Authentication
The worker enforces HTTP Basic Auth using the username/password from .env.

## Outputs

After `terraform apply`, you'll get:
- `pages_url`: Direct Cloudflare Pages URL
- `custom_domain_url`: Your custom domain URL (if configured)
- `worker_script_name`: Name of the auth worker

## Security Notes

- Keep `.env` private (it's gitignored)
- Use a strong password for HTTP Basic Auth
- The API token should have minimal required permissions:
  - Pages:Edit
  - Workers:Edit  
  - Zone:Edit (if using custom domain)