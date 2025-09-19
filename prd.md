# Product Requirements Document: Personal Metrics Dashboard

## Executive Summary
A web-based personal metrics tracking and visualization system that models life activities as interconnected metrics chains, inspired by factory production systems and Goodhart's Law principles. The system automatically generates static HTML dashboards from CSV data sources, providing a comprehensive view of personal performance across multiple life domains.

## Problem Statement
Current personal tracking solutions lack the ability to:
- Model the relationship between input activities and desired outcomes
- Visualize metric dependencies and causality chains
- Integrate data from multiple sources in a unified view
- Provide a simple, maintainable system without complex infrastructure

## Solution Overview
Build an automated static site generator that:
- Transforms CSV files and YAML configurations into visual dashboards
- Updates hourly via GitHub Actions or similar CI/CD
- Displays metrics in a DataDog-inspired interface
- Maps relationships between input, intermediate, and output metrics

## Goals & Success Metrics

### Primary Goals
- Create a unified view of personal metrics across life domains
- Establish clear relationships between activities and outcomes
- Enable data-driven decision making for personal improvement

### Success Criteria
- Dashboard loads on both mobile and desktop devices
- Automated builds complete successfully every hour
- Integration with at least 3 external data sources within first month
- Clear visualization of metric relationships and dependencies

## User Stories

### As a user, I want to:
1. **View my metrics dashboard** on any device to track my progress
2. **See relationships between metrics** to understand what drives outcomes
3. **Track metrics across life domains** (cycling, work, family, etc.) in one place
4. **Automatically import data** from various sources without manual entry
5. **Understand metric trends** through clear visualizations over time

## Functional Requirements

### Core Features

#### 1. Data Input System
- **CSV File Support**
  - One CSV file per metric
  - Pure CSV format (timestamp, value columns only)
  - Private data via git submodules or symlinks
- **YAML Configuration**
  - Centralized metric metadata in metrics.yaml
  - Define metric relationships and dependencies
  - Specify display properties, units, targets
  - Set metric categories and groupings

#### 2. Metric Hierarchy
- **Dynamic Tier System**: Metrics are automatically organized into tiers based on their dependency relationships
- **Tier 0**: Base metrics with no dependencies (e.g., revenue, FTP, racing points)
- **Tier N**: Metrics that are N steps removed from base metrics in the dependency chain
- **Automatic Calculation**: Tier assignment is computed using topological sorting of the dependency graph

#### 3. Visualization Components
- **Time-series graphs** for each metric using D3.js with interactive tooltips
- **Dendrogram visualization** showing metric dependencies as hierarchical trees
- **Category sections** grouping related metrics by life domain  
- **Tier-based organization** within categories (Tier 0 → Tier 1 → Tier N)
- **DataDog-style visual design** with dark theme and responsive layout
- **Custom favicon** representing metric relationships

#### 4. Life Domain Categories
- **Cycling**: FTP, racing points, weekly training hours
- **Work & Business**: revenue, active customers, value events (weekly)
- **Play/Personal**: (expandable)
- **Family**: (expandable)
- **Additional customizable categories** via YAML configuration

### Build & Deployment
- **Static Site Generation**
  - Hourly builds via GitHub Actions
  - Pure HTML/CSS/JS output to dist/ directory
  - No server-side dependencies
- **Automated Deployment**
  - GitHub Actions with Ruby/mise build pipeline
  - Direct upload to Cloudflare Pages via wrangler
  - HTTP Basic Auth protection via Cloudflare Workers
- **Infrastructure as Code**
  - Complete Terraform configuration for Cloudflare
  - Environment variable management via mise
  - Custom domain support with automatic DNS setup

## Technical Architecture

### Components
1. **Data Layer**
   - CSV files stored in private repository/symlink
   - Centralized YAML configuration (metrics.yaml)
   - Clean separation of code and data

2. **Build System**
   - Ruby-based modular architecture:
     - lib/datanate.rb (main orchestrator)
     - lib/metric_parser.rb (CSV parsing)
     - lib/tier_calculator.rb (dependency analysis)
     - lib/metric_data.rb (data formatting)
     - lib/dashboard_generator.rb (HTML generation)
   - ERB templating with helper methods
   - Mise task management and environment handling

3. **Frontend**
   - Responsive HTML/CSS with mobile-first design
   - D3.js for interactive charts and dendrogram visualization
   - Category-first, tier-based organization
   - Static file output optimized for CDN hosting

4. **Infrastructure**
   - Cloudflare Pages for hosting
   - Cloudflare Workers for HTTP Basic Auth
   - Terraform for infrastructure as code
   - GitHub Actions for CI/CD pipeline

### Data Flow
```
Private CSV Data → Metric Parser → Tier Calculator → Metric Data Formatter → Dashboard Generator → Static HTML → Cloudflare Pages
```

### Development Workflow
```
Local: mise build → mise serve (development)
Local: mise deploy (direct upload to Cloudflare)
CI/CD: GitHub Actions → wrangler upload → Cloudflare Pages (hourly + on commits)
```

## Integration Points

### Priority Integrations
- **Intervals.icu** (cycling metrics)
- **Zwift** (race results, power data)
- **Business metrics tools** (revenue, customer data)
- **Custom data entry scripts**

### Integration Format
- Standardized CSV export format
- API polling where available
- Manual CSV uploads as fallback

## Non-Functional Requirements

### Performance
- Page load time < 3 seconds
- Mobile-responsive design
- Offline viewing capability (static files)

### Maintainability
- Simple file-based configuration
- No database requirements
- Version control friendly (text files)

### Security
- Private data separation via git submodules/symlinks
- HTTP Basic Auth protection via Cloudflare Workers
- Infrastructure secrets managed via environment variables
- No sensitive data in public repository

## MVP Scope

### Phase 1 (MVP) ✅ COMPLETED
- ✅ Modular Ruby-based static site generator
- ✅ Pure CSV data format with centralized YAML config
- ✅ D3.js time-series graphs with interactive tooltips
- ✅ Dynamic tier calculation using topological sorting
- ✅ Mobile-responsive dark theme with DataDog-inspired design
- ✅ Mise task automation and environment management

### Phase 2 ✅ COMPLETED  
- ✅ Dendrogram visualization for metric relationships
- ✅ Category-first, tier-based dashboard organization
- ✅ Private data separation via symlinks
- ✅ Complete CI/CD pipeline with GitHub Actions
- ✅ Cloudflare Pages deployment with HTTP Basic Auth
- ✅ Infrastructure as Code with Terraform
- ✅ Custom domain support with automatic DNS

### Phase 3 (Future)
- First external integration (Intervals.icu)
- Multiple data source integrations
- Advanced trend analysis and forecasting
- Export capabilities and data backup
- Mobile app wrapper consideration

## Success Metrics for Product
- Build reliability > 99%
- Daily active usage
- At least 10 tracked metrics across 3+ life domains
- Successful integration with 3+ external services

## Open Questions
1. ✅ Specific charting library preference → D3.js selected
2. ✅ Hosting platform decision → Cloudflare Pages selected
3. ✅ Authentication requirements → HTTP Basic Auth via Cloudflare Workers
4. Backup and data retention policies?
5. Mobile app wrapper consideration?
6. Automated data collection frequency and reliability monitoring
7. SLO monitoring and alerting for dashboard availability

## Implementation Status ✅ COMPLETE

The personal metrics dashboard has been fully implemented according to the PRD specifications:

### ✅ Completed Implementation
- **Modular Ruby architecture** with clean separation of concerns
- **Dynamic tier system** based on metric dependency analysis  
- **Interactive D3.js visualizations** with dendrogram relationship diagrams
- **Complete CI/CD pipeline** with hourly automated deployments
- **Production infrastructure** via Terraform and Cloudflare
- **Security implementation** with HTTP Basic Auth protection
- **Private data handling** via git submodules/symlinks

### 🔄 Remaining Work (Phase 3)
- External data source integrations (Intervals.icu, etc.)
- Advanced analytics and trend forecasting
- SLO monitoring and alerting
- Demo deployment with sample data