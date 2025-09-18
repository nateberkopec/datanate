require 'csv'
require 'yaml'

class MetricParser
  def initialize(config_path = 'metrics.yaml')
    @config = YAML.load_file(config_path)
  end

  def parse_all_metrics
    metrics_data = {}
    
    @config['metrics'].each do |metric_id, metric_config|
      file_path = metric_config['file']
      next unless File.exist?(file_path)
      
      metrics_data[metric_id] = parse_csv_file(file_path, metric_config)
    end
    
    metrics_data
  end

  def config
    @config
  end

  private

  def parse_csv_file(file_path, metric_config)
    content = File.read(file_path)
    
    # Parse front matter if present
    front_matter = {}
    csv_content = content
    
    if content.start_with?('---')
      parts = content.split(/^---\s*$/, 3)
      if parts.length >= 3
        front_matter = YAML.load(parts[1]) || {}
        csv_content = parts[2].strip
      end
    end
    
    # Parse CSV data
    data_points = []
    CSV.parse(csv_content, headers: true) do |row|
      data_points << {
        timestamp: Date.parse(row['timestamp']),
        value: row['value'].to_f
      }
    end
    
    {
      config: metric_config.merge(front_matter),
      data: data_points.sort_by { |point| point[:timestamp] }
    }
  end
end