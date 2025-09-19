require 'erb'

class DashboardGenerator
  def initialize(metric_data, config, asset_manifest = {}, d3_manifest = {})
    @metric_data = metric_data
    @config = config
    @asset_manifest = asset_manifest
    @d3_manifest = d3_manifest
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

  def asset_path(filename)
    @asset_manifest[filename] || filename
  end

  def generate_import_map
    require 'json'

    # Read package.json to get D3 dependencies
    package_json = JSON.parse(File.read('package.json'))
    d3_modules = package_json['dependencies'].keys.select { |name| name.start_with?('d3') || name == 'internmap' }

    # Generate import map
    import_map = { 'imports' => {} }

    # Add D3 modules
    d3_modules.each do |module_name|
      hashed_module_name = @d3_manifest[module_name] || module_name
      import_map['imports'][module_name] = "/d3/#{hashed_module_name}/index.js"
    end

    # Add local modules dynamically (all assets/*.js files except app.js)
    js_files = Dir.glob('assets/*.js')
                  .map { |file| File.basename(file) }
                  .reject { |file| file == 'app.js' }

    js_files.each do |filename|
      hashed_filename = asset_path(filename)
      import_map['imports'][filename] = "/#{hashed_filename}"
    end

    JSON.pretty_generate(import_map)
  end
end
