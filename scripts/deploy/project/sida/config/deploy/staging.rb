server '188.166.188.231', user: 'sida', roles: %w{web app}, port:2222

# Directory to deploy
# ===================
set :env, 'staging'
set :deploy_to, '/home/sida/www/staging'
set :shared_path, '/home/sida/www/staging/shared'
set :overlay_path, '/home/sida/www/staging/overlay'
