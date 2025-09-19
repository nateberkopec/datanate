# Terraform Infrastructure for Datanate Dashboard

This Terraform configuration sets up the complete infrastructure for automatically deploying your metrics dashboard to Cloudflare Pages with Cloudflare Access authentication.

## Architecture

- **Cloudflare Pages**: Hosts the static dashboard
- **Cloudflare Access**: Provides authentication protection for all domains
- **Cloudflare R2**: Stores Terraform state remotely
- **GitHub Actions**: Builds and deploys hourly + on commits

## Prerequisites

1. **Cloudflare Account** with Pages and Zero Trust (Access) enabled
2. **Custom domain** added to your Cloudflare account (see below)
3. **Terraform** installed locally
4. **Private data repository** on GitHub with your CSV files

### Setting Up Your Custom Domain

You need a domain name managed by Cloudflare. This means:

1. **Own a domain** (e.g., `yourdomain.com`) - purchased from any registrar
2. **Transfer DNS to Cloudflare**:
   - Add your domain to Cloudflare (Dashboard → Add Site)
   - Update your domain's nameservers to point to Cloudflare
   - Wait for DNS propagation (usually 24-48 hours)
3. **Choose a subdomain** for your dashboard (e.g., `dashboard.yourdomain.com`)

**That's it!** Just set the `TF_VAR_custom_domain` variable to your chosen subdomain. Terraform will automatically:
- Create the DNS record pointing to Cloudflare Pages
- Set up the custom domain in your Pages project
- Configure Cloudflare Access for both custom domain and all Pages deployment URLs

**Important**: The domain must be fully managed by Cloudflare (orange-clouded) for authentication to work properly.

**Example setup**:
- You own: `mydomain.com`
- Cloudflare manages: `mydomain.com` DNS
- Set variable: `TF_VAR_custom_domain=dashboard.mydomain.com`
- Terraform creates everything automatically!

## Setup

1. **Copy environment configuration:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your values** in `.env`:
   - `TF_VAR_cloudflare_api_token`: API token from Dashboard > My Profile > API Tokens (needs Pages:Edit, Zone:Edit, Access:Edit permissions)
   - `TF_VAR_cloudflare_account_id`: Account ID from Dashboard > Right sidebar
   - `TF_VAR_cloudflare_zone_id`: Zone ID from Dashboard > Your Domain > Right sidebar
   - `TF_VAR_custom_domain`: Your custom subdomain (e.g., `dashboard.yourdomain.com`)
   - `TF_VAR_project_name`: Your project name (e.g., `my-dashboard`)
   - `TF_VAR_access_email`: Your email address for authentication access
   - R2 credentials for Terraform state storage

3. **Create R2 bucket for Terraform state:**
   - Go to Cloudflare Dashboard > R2 Object Storage
   - Create bucket named `my-project-terraform-state` (or update `backend.hcl`)
   - Create R2 API token with Object Read & Write permissions
   - Update `backend.hcl` with your account ID

4. **Initialize and apply using mise:**
   ```bash
   mise tf-init -backend-config=backend.hcl
   mise tf-plan
   mise tf-apply
   ```

5. **Set GitHub Secrets** (for CI/CD):
   - `CLOUDFLARE_API_TOKEN`: Same token from .env
   - `CLOUDFLARE_ACCOUNT_ID`: Same account ID from .env
   - `PRIVATE_DATA_REPO`: Your private data repository (e.g., `username/my-data`)
   - `PRIVATE_REPO_TOKEN`: GitHub Personal Access Token with repo scope
   - `PROJECT_NAME`: Same as `TF_VAR_project_name`

## Local Deployment

You can also deploy locally using mise:

```bash
mise deploy
```

This will build and deploy your dashboard directly from your machine.

## Configuration

### Required Variables
- `TF_VAR_custom_domain`: Your custom subdomain (must be in Cloudflare)
- `TF_VAR_project_name`: Unique project name for all resources
- `TF_VAR_access_email`: Email address allowed to access the dashboard

### Authentication
Cloudflare Access provides authentication using:
- Email verification (one-time PIN)
- Social logins (Google, GitHub, etc.)
- Corporate SSO (if configured)

All deployment URLs are protected, including preview deployments.

## Outputs

After `terraform apply`, you'll get:
- `dashboard_url`: Your custom domain URL
- `pages_subdomain`: Direct Cloudflare Pages URL (also protected)
- `access_custom_domain`: Access application for custom domain
- `access_deployments_domain`: Access application for all deployments

## Security Features

- **Comprehensive protection**: Both custom domain and all `*.pages.dev` URLs are protected
- **No public access**: All deployment previews require authentication
- **Session management**: 30-day session duration for convenience
- **Zero Trust integration**: Full Cloudflare Access features available

## API Token Permissions

Your Cloudflare API token needs these permissions:
- `Pages:Edit` - Manage Pages projects
- `Zone:Edit` - Manage DNS records for custom domain
- `Access:Edit` - Manage Zero Trust Access applications
- Zone resources must include your specific domain