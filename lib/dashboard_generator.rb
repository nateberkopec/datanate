require 'erb'
require 'json'

class DashboardGenerator
  def initialize(metrics_data, config)
    @metrics_data = metrics_data
    @config = config
  end

  def generate_html
    template = File.read('templates/dashboard.html.erb')
    erb = ERB.new(template)
    erb.result(binding)
  end

  def generate_js_data
    tiers = calculate_metric_tiers
    js_data = {}
    
    @metrics_data.each do |metric_id, metric_info|
      js_data[metric_id] = {
        config: metric_info[:config].merge('tier' => tiers[metric_id] || 0),
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

  def categories
    @config['categories']
  end

  def calculate_metric_tiers
    # Build dependency graph
    dependencies = {}
    dependents = {}
    
    @config['metrics'].each do |metric_id, metric_config|
      dependencies[metric_id] = []
      dependents[metric_id] = []
      
      if metric_config['relationships'] && metric_config['relationships']['influenced_by']
        dependencies[metric_id] = metric_config['relationships']['influenced_by']
      end
    end
    
    # Build reverse dependencies (what each metric influences)
    dependencies.each do |metric_id, deps|
      deps.each do |dep_id|
        dependents[dep_id] << metric_id
      end
    end
    
    # Calculate tiers using topological sort
    tiers = {}
    visited = {}
    
    def calculate_tier(metric_id, dependencies, tiers, visited)
      return tiers[metric_id] if visited[metric_id]
      
      visited[metric_id] = true
      
      # If no dependencies, it's tier 0
      if dependencies[metric_id].empty?
        tiers[metric_id] = 0
      else
        # Tier is max tier of dependencies + 1
        max_dep_tier = dependencies[metric_id].map do |dep_id|
          calculate_tier(dep_id, dependencies, tiers, visited)
        end.max
        tiers[metric_id] = max_dep_tier + 1
      end
      
      tiers[metric_id]
    end
    
    @config['metrics'].keys.each do |metric_id|
      calculate_tier(metric_id, dependencies, tiers, visited)
    end
    
    tiers
  end

  def grouped_metrics
    tiers = calculate_metric_tiers
    grouped = {}
    
    @metrics_data.each do |metric_id, metric_info|
      category = metric_info[:config]['category']
      tier = tiers[metric_id] || 0
      
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

  def layout_sections
    @config['layout']['sections']
  end

  def metrics_for_section(metric_ids)
    metric_ids.map do |metric_id|
      next unless @metrics_data[metric_id]
      
      {
        id: metric_id,
        config: @metrics_data[metric_id][:config],
        latest_value: @metrics_data[metric_id][:data].last&.dig(:value),
        data_points: @metrics_data[metric_id][:data].length
      }
    end.compact
  end

  def metric_relationships
    relationships = {}
    
    @config['metrics'].each do |metric_id, metric_config|
      if metric_config['relationships']
        relationships[metric_id] = metric_config['relationships']
      end
    end
    
    relationships
  end
end