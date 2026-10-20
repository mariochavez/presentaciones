# Rakefile

require 'rack'
require 'webrick'

desc 'Start a local server to view presentations'
task :server, [:port] do |t, args|
  port = args[:port] || 8000

  puts "Starting server on http://localhost:#{port}"
  puts 'Press Ctrl+C to stop the server'
  puts "\nAvailable presentations:"
  puts "  http://localhost:#{port}/"
  puts "  http://localhost:#{port}/playasontec/"
  puts "\n"

  # Create a simple Rack app to serve static files
  app = Rack::Builder.new do
    use Rack::Static,
        urls: ['/css', '/js', '/images', '/playasontec'],
        root: '.',
        index: 'index.html',
        header_rules: [
          [:all, { 'Cache-Control' => 'no-cache, no-store, must-revalidate' }],
          [:all, { 'Pragma' => 'no-cache' }],
          [:all, { 'Expires' => '0' }]
        ]

    # Serve index.html for root path
    map '/' do
      run lambda { |env|
        if env['PATH_INFO'] == '/'
          [200, { 'Content-Type' => 'text/html' }, [File.read('index.html')]]
        else
          [404, { 'Content-Type' => 'text/plain' }, ['Not Found']]
        end
      }
    end

    # Serve playasontec/index.html
    map '/playasontec' do
      run lambda { |env|
        if ['/', ''].include?(env['PATH_INFO'])
          [200, { 'Content-Type' => 'text/html' }, [File.read('playasontec/index.html')]]
        else
          # Try to serve the file from playasontec directory
          file_path = "playasontec#{env['PATH_INFO']}"
          if File.exist?(file_path) && !File.directory?(file_path)
            content_type = case File.extname(file_path)
                           when '.html' then 'text/html'
                           when '.css' then 'text/css'
                           when '.js' then 'application/javascript'
                           when '.jpg', '.jpeg' then 'image/jpeg'
                           when '.png' then 'image/png'
                           when '.gif' then 'image/gif'
                           when '.svg' then 'image/svg+xml'
                           else 'application/octet-stream'
                           end

            [200, { 'Content-Type' => content_type }, [File.read(file_path, mode: 'rb')]]
          else
            [404, { 'Content-Type' => 'text/plain' }, ['Not Found']]
          end
        end
      }
    end
  end

  # Use rackup for Rack 3.x compatibility
  require 'rackup'
  Rackup::Handler::WEBrick.run app, Port: port, Host: '0.0.0.0'
end

desc 'Start server on default port 8000'
task serve: :server

desc 'List all presentations'
task :list do
  puts 'Available presentations:'
  puts '  / (root index.html)'

  Dir.glob('*/index.html').each do |file|
    presentation = File.dirname(file)
    puts "  /#{presentation}/"
  end
end

# Default task
task default: :list
