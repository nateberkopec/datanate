#!/usr/bin/env ruby

$LOAD_PATH.unshift(File.expand_path('lib', __dir__))

require 'metric_parser'
require 'dashboard_generator'

def number_with_delimiter(number)
  return '' if number.nil?
  number.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
end

class MetricsDashboard
  def self.generate(config_file = 'metrics.yaml', output_dir = 'dist')
    # Create output directory
    Dir.mkdir(output_dir) unless Dir.exist?(output_dir)
    
    parser = MetricParser.new(config_file)
    metrics_data = parser.parse_all_metrics
    
    generator = DashboardGenerator.new(metrics_data, parser.config)
    html_content = generator.generate_html
    
    output_file = File.join(output_dir, 'index.html')
    File.write(output_file, html_content)
    
    puts "Dashboard generated successfully!"
    puts "Output: #{output_file}"
    puts "Metrics processed: #{metrics_data.keys.join(', ')}"
  end
end

if __FILE__ == $0
  MetricsDashboard.generate
end