# Datanate

Personal metrics dashboard that models life activities as interconnected metrics chains.

## Setup

1. **Install dependencies:**
   ```bash
   mise setup
   ```

2. **Set up your data:**
   ```bash
   # Option 1: Add a local repository as a submodule
   git submodule add ../your-private-metrics-data csv
   
   # Option 2: Add a remote GitHub repository as a submodule
   git submodule add https://github.com/yourusername/your-private-metrics-data.git csv

   # Initialize and update submodules
   git submodule update --init --recursive
   ```

3. **Generate dashboard:**
   ```bash
   mise build
   ```

4. **Serve locally:**
   ```bash
   mise serve
   ```

## Data Structure

Create a private repository with CSV files in this format:

```
csv/
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

Edit `metrics.yaml` to define:
- Categories and their colors
- Metric metadata (display names, units, targets)
- CSV file paths for each metric
- Metric relationships (influences/influenced_by)

The system automatically calculates tiers based on dependency relationships.

## Usage

- `mise setup` - Install dependencies
- `mise build` - Generate static dashboard
- `mise serve` - Serve dashboard locally on port 8080

## Architecture

- **lib/datanate.rb** - Main entry point
- **lib/metric_parser.rb** - CSV parsing and configuration loading
- **lib/tier_calculator.rb** - Dependency-based tier calculation
- **lib/metric_data.rb** - Data formatting and grouping
- **lib/dashboard_generator.rb** - HTML generation with ERB templates
