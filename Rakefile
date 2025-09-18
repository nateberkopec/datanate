$LOAD_PATH.unshift(File.expand_path('lib', __dir__))
require 'datanate'

desc "Generate the metrics dashboard"
task :generate do
  Datanate.generate
end

task default: :generate