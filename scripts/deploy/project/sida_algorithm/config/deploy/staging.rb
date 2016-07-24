server '188.166.188.231', user: 'sida', roles: %w{web app}, port:2222

# Directory to deploy
# ===================
set :env, 'staging'
set :deploy_to, '/home/sida/algorithm/staging'
set :overlay_path, '/home/sida/algorithm/staging/overlay'
