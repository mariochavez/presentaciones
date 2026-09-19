# config.ru

require 'rack'

use Rack::Static,
    urls: ['/css', '/js', '/images', '/playasontec', '/favicon.ico'],
    root: '.',
    index: 'index.html',
    header_rules: [
      [:all, { 'Cache-Control' => 'no-cache, no-store, must-revalidate' }]
    ]

# Serve files with proper content types
run lambda { |env|
  path = env['PATH_INFO']

  # Handle root
  return [200, { 'Content-Type' => 'text/html' }, [File.read('index.html')]] if path == '/'

  # Handle directories with index.html
  if path.end_with?('/')
    index_path = path[1..-1] + 'index.html'
    return [200, { 'Content-Type' => 'text/html' }, [File.read(index_path)]] if File.exist?(index_path)
  end

  # Try to serve the file directly
  file_path = path[1..-1] # Remove leading slash
  if File.exist?(file_path) && !File.directory?(file_path)
    content_type = case File.extname(file_path)
                   when '.html' then 'text/html'
                   when '.css' then 'text/css'
                   when '.js' then 'application/javascript'
                   when '.jpg', '.jpeg' then 'image/jpeg'
                   when '.png' then 'image/png'
                   when '.gif' then 'image/gif'
                   when '.svg' then 'image/svg+xml'
                   when '.json' then 'application/json'
                   else 'application/octet-stream'
                   end

    return [200, { 'Content-Type' => content_type }, [File.read(file_path, mode: 'rb')]]
  end

  [404, { 'Content-Type' => 'text/plain' }, ['Not Found']]
}
