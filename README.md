# Datanate

Personal metrics dashboard that models life activities as interconnected metrics chains. Features automatic deployment to Cloudflare Pages with authentication and CI/CD.

## Quick Start

1. **Install dependencies:**
   ```bash
   mise setup
   ```

2. **Set up your data:**
   ```bash
   # Option 1: Link to a local repository (symlink) - recommended for development
   ln -s ../your-private-metrics-data data

   # Option 2: Copy data files directly
   cp /path/to/your/csv/files/* data/
   ```

   Then, create your metrics config and env file:

   ```
   cp metrics.example.yaml data/metrics.yaml
   cp .env.example .env
   ```

3. **Generate dashboard:**
   ```bash
   mise build
   ```

4. **Development server with auto-rebuild:**
   ```bash
   overmind start
   ```

   Or serve manually:
   ```bash
   mise serve
   ```

## Production Deployment

For automatic deployment to Cloudflare Pages with authentication, see the [Terraform setup guide](terraform/README.md).

## Data Structure

Create a private repository with CSV files in this format:

```
data/
├── cycling_ftp.csv
├── cycling_training_hours.csv
├── cycling_race_points.csv
├── work_revenue.csv
├── work_customers.csv
└── work_value_events.csv
```

Each CSV should contain only timestamp/value columns:

```csv
timestamp,value
2024-01-01,285
2024-01-15,290
2024-02-01,295
2024-02-15,300
...
```

## Configuration

Edit `data/metrics.yaml` to define:
- Categories and their colors
- Metric metadata (display names, units, targets)
- CSV file paths for each metric
- Metric relationships (influences/influenced_by)

The system automatically calculates tiers based on dependency relationships.

## Usage

- `mise setup` - Install dependencies
- `mise build` - Generate static dashboard
- `mise serve` - Serve dashboard locally on port 8080
- `overmind start` - Start development server with auto-rebuild on file changes

## Architecture

- **lib/datanate.rb** - Main entry point
- **lib/metric_parser.rb** - CSV parsing and configuration loading
- **lib/tier_calculator.rb** - Dependency-based tier calculation
- **lib/metric_data.rb** - Data formatting and grouping
- **lib/dashboard_generator.rb** - HTML generation with ERB templates
