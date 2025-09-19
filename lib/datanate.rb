#!/usr/bin/env ruby

$LOAD_PATH.unshift(__dir__)

require 'metric_parser'
require 'tier_calculator'
require 'metric_data'
require 'dashboard_generator'

class Datanate
  def self.generate(config_file: 'data/metrics.yaml', output_dir: 'dist')
    # Adjust paths when running from lib directory
    if __FILE__ == $0
      config_file = File.join('..', config_file) unless File.exist?(config_file)
      output_dir = File.join('..', output_dir) unless File.absolute_path(output_dir) == output_dir
    end
    new(config_file, output_dir).generate
  end

  def initialize(config_file, output_dir)
    @config_file = config_file
    @output_dir = output_dir
  end

  def generate
    ensure_csv_dir
    ensure_output_dir
    copy_assets

    # Parse configuration and CSV data
    parser = MetricParser.new(@config_file)
    metrics_data = parser.parse_all_metrics
    config = parser.config

    # Calculate metric tiers
    tier_calculator = TierCalculator.new(config['metrics'])
    tiers = tier_calculator.calculate_tiers

    # Prepare data for dashboard
    metric_data = MetricData.new(metrics_data, config, tiers)

    # Generate HTML
    generator = DashboardGenerator.new(metric_data, config)
    html_content = generator.generate_html

    # Write output
    output_file = File.join(@output_dir, 'index.html')
    File.write(output_file, html_content)

    report_success(output_file, metrics_data.keys)
  end

  private

  def ensure_csv_dir
    unless Dir.exist?('data')
      puts "ERROR: data directory not found!"
      puts ""
      puts "You need to set up your data:"
      puts "  # Option 1: Link to a local repository (symlink) - recommended for development"
      puts "  ln -s ../your-private-metrics-data data"
      puts ""
      puts "  # Option 2: Copy data files directly"
      puts "  cp /path/to/your/csv/files/* data/"
      puts ""
      exit 1
    end
  end

  def ensure_output_dir
    Dir.mkdir(@output_dir) unless Dir.exist?(@output_dir)
  end

  def copy_assets
    require 'fileutils'

    # Copy CSS file
    css_source = File.join('assets', 'style.css')
    css_dest = File.join(@output_dir, 'style.css')
    FileUtils.cp(css_source, css_dest) if File.exist?(css_source)

    # Copy JavaScript file
    js_source = File.join('assets', 'app.js')
    js_dest = File.join(@output_dir, 'app.js')
    FileUtils.cp(js_source, js_dest) if File.exist?(js_source)

    # Copy favicon
    favicon_source = File.join('assets', 'favicon.svg')
    favicon_dest = File.join(@output_dir, 'favicon.svg')
    FileUtils.cp(favicon_source, favicon_dest) if File.exist?(favicon_source)

    # Copy D3 library from node_modules
    d3_source = File.join('node_modules', 'd3', 'dist', 'd3.js')
    d3_dest = File.join(@output_dir, 'd3.js')
    FileUtils.cp(d3_source, d3_dest) if File.exist?(d3_source)
  end

  def report_success(output_file, metric_ids)
    puts "Dashboard generated successfully!"
    puts "Output: #{output_file}"
    puts "Metrics processed: #{metric_ids.join(', ')}"
  end
end

if __FILE__ == $0
  Datanate.generate
end
