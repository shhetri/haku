server '128.199.114.104', user: 'haku', roles: %w{app}

# Directory to deploy
# ===================
set :env, 'production'
set :deploy_to, '/home/haku'
set :projects_path, '/home/haku/projects'
