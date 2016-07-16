# config valid only for current version of Capistrano
lock '3.5.0'

# application name
set :application, 'blog'
set :branch,          ENV["branch"] || "master"

# repo url to the project
set :repo_url, 'https://github.com/shhetri/blog.git'

require 'date'
set :current_time, DateTime.now

namespace :environment do
    desc "Set environment variables"
    task :set_variables do
        on roles(:app) do
              puts ("--> Create enviroment configuration file")
              execute "cat /dev/null > #{fetch(:app_path)}/.env"
              execute "echo APP_DEBUG=#{fetch(:app_debug)} >> #{fetch(:app_path)}/.env"
              execute "echo APP_KEY=#{fetch(:app_key)} >> #{fetch(:app_path)}/.env"
        end
    end
end

namespace :composer do
    desc "Running Composer Install"
    task :install do
        on roles(:app) do
            within release_path do
                execute :composer, "install --no-dev --no-interaction --quiet"
                execute :composer, "dumpautoload"
            end
        end
    end
end

namespace :php5 do
    desc 'Restart php5-fpm'
        task :restart do
            on roles(:web) do
            execute :sudo, :service, "php5-fpm restart"
        end
    end
end

namespace :version do
  desc 'Create ver.txt'
      task :create do
        on roles(:web) do
        puts ("--> Creating ver.txt at base URL")
            execute "cp #{release_path}/config/deploy/ver.txt.example #{release_path}/public/ver.txt"
            execute "sed 's/%date%/#{fetch(:current_time)}/g
            s/%branch%/#{fetch(:branch)}/g
            s/%revision%/#{fetch(:current_revision)}/g
            s/%deployed_by%/yin/g' #{release_path}/public/ver.txt"
      end
  end
end

namespace :deploy do
  after :updated, "composer:install"
  after :finished, "environment:set_variables"
  after :finished, "version:create"
end

after "deploy",   "php5:restart"