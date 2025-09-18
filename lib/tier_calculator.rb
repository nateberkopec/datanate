class TierCalculator
  def initialize(metrics_config)
    @metrics_config = metrics_config
  end

  def calculate_tiers
    dependencies = build_dependencies
    tiers = {}
    visited = {}
    
    @metrics_config.keys.each do |metric_id|
      calculate_tier(metric_id, dependencies, tiers, visited)
    end
    
    tiers
  end

  private

  def build_dependencies
    dependencies = {}
    
    @metrics_config.each do |metric_id, metric_config|
      dependencies[metric_id] = []
      
      if metric_config['relationships']&.dig('influenced_by')
        dependencies[metric_id] = metric_config['relationships']['influenced_by']
      end
    end
    
    dependencies
  end

  def calculate_tier(metric_id, dependencies, tiers, visited)
    return tiers[metric_id] if visited[metric_id]
    
    visited[metric_id] = true
    
    if dependencies[metric_id].empty?
      tiers[metric_id] = 0
    else
      max_dep_tier = dependencies[metric_id].map do |dep_id|
        calculate_tier(dep_id, dependencies, tiers, visited)
      end.max
      tiers[metric_id] = max_dep_tier + 1
    end
    
    tiers[metric_id]
  end
end