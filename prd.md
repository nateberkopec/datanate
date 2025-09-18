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
  - Optional front matter for configuration
  - Standardized column format for timestamp and values
- **YAML Configuration**
  - Define metric relationships
  - Specify display properties
  - Set metric categories and groupings

#### 2. Metric Hierarchy
- **Dynamic Tier System**: Metrics are automatically organized into tiers based on their dependency relationships
- **Tier 0**: Base metrics with no dependencies (e.g., revenue, FTP, racing points)
- **Tier N**: Metrics that are N steps removed from base metrics in the dependency chain
- **Automatic Calculation**: Tier assignment is computed using topological sorting of the dependency graph

#### 3. Visualization Components
- **Time-series graphs** for each metric using D3.js
- **Relationship diagrams** showing metric dependencies as interactive network graphs
- **Category sections** grouping related metrics by life domain
- **Tier-based organization** within categories (Tier 0 → Tier 1 → Tier N)
- **DataDog-style visual design** with dark theme for familiarity

#### 4. Life Domain Categories
- **Cycling**: FTP, racing points, weekly training hours
- **Work & Business**: revenue, active customers, value events (weekly)
- **Play/Personal**: (expandable)
- **Family**: (expandable)
- **Additional customizable categories** via YAML configuration

### Build & Deployment
- **Static Site Generation**
  - Hourly builds via CI/CD pipeline
  - Pure HTML/CSS/JS output
  - No server-side dependencies
- **GitHub Actions Integration**
  - Automated build triggers
  - Deploy to GitHub Pages or similar

## Technical Architecture

### Components
1. **Data Layer**
   - CSV files stored in repository
   - YAML configuration files
   - Integration scripts for external services

2. **Build System**
   - Ruby-based static site generator with ERB templating
   - Automated tier calculation using topological sorting
   - CSS framework for DataDog-like styling with dark theme

3. **Frontend**
   - Responsive HTML/CSS with mobile-first design
   - D3.js for interactive time-series charts and network diagrams
   - Static file output for optimal performance and hosting

### Data Flow
```
External Services → Integration Scripts → CSV Files → Ruby Generator → Tier Calculation → ERB Templates → Static HTML → Web Host
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
- No sensitive data in public repository
- Optional password protection for hosted site
- Data anonymization options

## MVP Scope

### Phase 1 (MVP) ✅ COMPLETED
- ✅ Basic CSV to HTML conversion with Ruby generator
- ✅ D3.js time-series graphs for each metric
- ✅ Manual CSV updates with YAML front matter support
- ✅ Rake-based build automation (`rake generate`)
- ✅ Mobile-responsive dark theme layout
- ✅ Dynamic tier calculation based on metric dependencies

### Phase 2
- ✅ Interactive metric relationship visualization (network diagram)
- ✅ YAML-based configuration with categories and relationships
- ✅ Metric grouping by category and tier
- ⏳ First external integration (Intervals.icu)

### Phase 3
- Multiple data source integrations
- Advanced visualizations and trend analysis
- Export capabilities
- Hourly build automation via CI/CD

## Success Metrics for Product
- Build reliability > 99%
- Daily active usage
- At least 10 tracked metrics across 3+ life domains
- Successful integration with 3+ external services

## Open Questions
1. ✅ Specific charting library preference → D3.js selected
2. Hosting platform decision (GitHub Pages vs Netlify vs custom)?
3. Authentication requirements for sensitive metrics?
4. Backup and data retention policies?
5. Mobile app wrapper consideration?
6. Automated data collection frequency and reliability monitoring

## Next Steps
1. Create repository structure
2. Build CSV parsing prototype
3. Design DataDog-inspired UI mockups
4. Set up GitHub Actions workflow
5. Implement first metric visualization