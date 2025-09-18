require 'erb'

class DashboardGenerator
  def initialize(metric_data, config)
    @metric_data = metric_data
    @config = config
  end

  def generate_html
    template_path = find_template_path('dashboard.html.erb')
    template = File.read(template_path)
    erb = ERB.new(template)
    erb.result(binding)
  end

  private

  def find_template_path(filename)
    possible_paths = [
      File.join('templates', filename),
      File.join('..', 'templates', filename)
    ]
    
    possible_paths.find { |path| File.exist?(path) } || 
      raise("Template not found: #{filename}")
  end

  # Template helper methods
  def generate_js_data
    @metric_data.to_js_data
  end

  def categories
    @config['categories']
  end

  def grouped_metrics
    @metric_data.grouped_by_category_and_tier
  end

  def metric_relationships
    @metric_data.relationships
  end

  def number_with_delimiter(number)
    MetricData.number_with_delimiter(number)
  end
end