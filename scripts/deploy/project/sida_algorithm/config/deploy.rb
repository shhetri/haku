lock '3.5.0'

# Application #
#####################################################################################
set :application,     'sida-algorithm'
set :branch,          ENV["branch"] || "master"
set :user,            ENV["user"] || ENV["USER"] || "sida"
set :tmp_dir,         '/home/sida/algorithm/tmp'


# SCM #
#####################################################################################
set :repo_url,        'git@gitlab.yipl.com.np:web-apps/sida-algorithm.git'
set :scm,             :git
set :repo_base_url,   :'http://gitlab.yipl.com.np/'
set :repo_diff_path,  :'web-apps/sida-algorithm/compare/master...'


# Multistage Deployment #
#####################################################################################
set :stages,              %w(staging production)
set :default_stage,       "staging"


# Other Options #
#####################################################################################
set :ssh_options,         { :forward_agent => true }
set :default_run_options, { :pty => true }


# Permissions #
#####################################################################################
set :use_sudo,            false
set :permission_method,   :acl
set :use_set_permissions, true
set :webserver_user,      "www-data"
set :group,               "www-data"
set :keep_releases,       1

# Hipchat Integration #
#####################################################################################
set :hipchat_token,         "ZpXA6zeepyBgIm4R3EbImcmm7xCcXMl49NbbEpRg"
set :hipchat_room_name,     "1080583"

# Set current time #
#######################################################################################
require 'date'
set :current_time, DateTime.now

namespace :environment do

    desc "Set environment variables"
    task :set_variables do
        on roles(:app) do
              puts ("--> Copying environment configuration file")
              execute "cp #{release_path}/.env.server #{release_path}/.env"
              puts ("--> Setting environment variables")
              execute "sed --in-place -f #{fetch(:overlay_path)}/parameters.sed #{release_path}/.env"
        end
    end
end

namespace :composer do

    desc "Running Composer Install"
    task :install do
        on roles(:app) do
            within release_path do
                execute :composer, "install --no-dev --quiet"
                execute :composer, "dump-autoload -o"
            end
        end
    end
end

namespace :vendor do
    desc 'Copy vendor directory from last release'
    task :copy do
        on roles(:web) do
            puts ("--> Copy vendor folder from previous release")
            execute "vendorDir=#{current_path}/vendor; if [ -d $vendorDir ] || [ -h $vendorDir ]; then cp -a $vendorDir #{release_path}/vendor; fi;"
        end
    end
end

namespace :hipchat do

    desc 'Notify Hipchat'
    task :notify do
        on roles(:all) do
            execute "curl -s -H 'Content-Type: application/json' -X POST -d '{\"color\": \"#{fetch(:notify_color)}\", \"message_format\": \"text\", \"message\": \"#{fetch(:notify_message)}\", \"notify\": \"true\" }' https://api.hipchat.com/v2/room/#{fetch(:hipchat_room_name)}/notification?auth_token=#{fetch(:hipchat_token)}"
            Rake::Task["hipchat:notify"].reenable
        end
    end

    desc 'Hipchat notification on deployment'
    task :start do
        on roles(:all) do
            message  = "#{fetch(:user)} is deploying #{fetch(:application)}/#{fetch(:branch)} to #{fetch(:env)}. diff at: #{fetch(:repo_base_url)}#{fetch(:repo_diff_path)}#{fetch(:branch)}"
            set :notify_message, message
            set :notify_color, 'gray'
            invoke "hipchat:notify"
        end
    end

    task :deployed do
        on roles(:all) do
            message  = "#{fetch(:user)} finished deploying #{fetch(:application)}/#{fetch(:branch)} (revision #{fetch(:current_revision)}) to #{fetch(:env)}."
            set :notify_message, message
            set :notify_color, 'green'
            invoke "hipchat:notify"
        end
    end

    task :notify_deploy_failed do
        on roles(:all) do
            message  = "Error deploying #{fetch(:application)}/#{fetch(:branch)} (revision #{fetch(:current_revision)}) to #{fetch(:env)}, user: #{fetch(:user)} ."
            set :notify_message, message
            set :notify_color, 'red'
            invoke "hipchat:notify"
        end
    end
end

namespace :php_fpm do
    desc 'Restart php-fpm'
        task :restart do
            on roles(:all) do
            execute :sudo, :service, "php5.6-fpm restart"
        end
    end
end

namespace :deploy do
    after :starting, "hipchat:start"
    after :updated, "vendor:copy"
    after :updated, "composer:install"
    after :updated, "environment:set_variables"
    after :finished, "hipchat:deployed"
    after :failed, "hipchat:notify_deploy_failed"
end

after "deploy",   "php_fpm:restart"
