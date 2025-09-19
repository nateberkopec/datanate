# Terraform Infrastructure for Datanate Dashboard

This Terraform configuration sets up the complete infrastructure for automatically deploying your Datanate dashboard to Cloudflare Pages with HTTP Basic Auth protection.

## Architecture

- **Cloudflare Pages**: Hosts the static dashboard
- **Cloudflare Worker**: Provides HTTP Basic Auth protection
- **GitHub Actions**: Builds and deploys hourly + on commits

## Prerequisites

1. **Cloudflare Account** with Pages and Workers enabled
2. **Custom domain** added to your Cloudflare account (see below)
3. **Terraform** installed locally
4. **Node.js** installed (for wrangler CLI)

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
- Configure the Worker route for authentication

**Important**: The domain must be fully managed by Cloudflare (orange-clouded) for the Worker authentication to work properly.

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
   - Get Cloudflare API token from: Dashboard > My Profile > API Tokens
   - Get Account ID from: Dashboard > Right sidebar
   - Get Zone ID from: Dashboard > Your Domain > Right sidebar
   - Set your custom domain (must be added to Cloudflare first)

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

## Local Deployment

You can also deploy locally using mise:

```bash
mise deploy
```

This will build and deploy your dashboard directly from your machine.

## Configuration

### Custom Domain (Required)
Set `TF_VAR_custom_domain` in .env to your desired subdomain. The domain must be added to your Cloudflare account first.

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