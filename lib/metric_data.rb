require 'json'

class MetricData
  def initialize(metrics_data, config, tiers)
    @metrics_data = metrics_data
    @config = config
    @tiers = tiers
  end

  def grouped_by_category_and_tier
    grouped = {}
    
    @metrics_data.each do |metric_id, metric_info|
      category = metric_info[:config]['category']
      tier = @tiers[metric_id] || 0
      
      grouped[category] ||= {}
      grouped[category][tier] ||= []
      
      grouped[category][tier] << {
        id: metric_id,
        config: metric_info[:config],
        latest_value: metric_info[:data].last&.dig(:value),
        data_points: metric_info[:data].length,
        tier: tier
      }
    end
    
    grouped
  end

  def to_js_data
    js_data = {}
    
    @metrics_data.each do |metric_id, metric_info|
      js_data[metric_id] = {
        config: metric_info[:config].merge('tier' => @tiers[metric_id] || 0),
        data: metric_info[:data].map do |point|
          {
            date: point[:timestamp].strftime('%Y-%m-%d'),
            value: point[:value]
          }
        end
      }
    end
    
    js_data.to_json
  end

  def relationships
    relationships = {}
    
    @config['metrics'].each do |metric_id, metric_config|
      if metric_config['relationships']
        relationships[metric_id] = metric_config['relationships']
      end
    end
    
    relationships
  end

  def self.number_with_delimiter(number)
    return '' if number.nil?
    number.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
  end
end