lock '3.5.0'


# Application #
#####################################################################################
set :application,     'sida'
set :branch,          ENV["branch"] || "master"
set :user,            ENV["user"] || ENV["USER"] || "sida"
set :tmp_dir,         '/home/sida/tmp'


# SCM #
#####################################################################################
set :repo_url,        'git@gitlab.yipl.com.np:web-apps/sida.git'
set :scm,             :git
set :repo_base_url,   :'http://gitlab.yipl.com.np/'
set :repo_diff_path,  :'web-apps/sida/compare/master...'


# Multistage Deployment #
#####################################################################################
set :stages,              %w(dev staging prod)
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

namespace :sida do

    desc "Create shared folders"
    task :create_storage_folder do
        on roles(:all) do
            execute "mkdir -p #{shared_path}/storage"
            execute "mkdir #{shared_path}/storage/app"
            execute "mkdir #{shared_path}/storage/framework"
            execute "mkdir #{shared_path}/storage/framework/cache"
            execute "mkdir #{shared_path}/storage/framework/sessions"
            execute "mkdir #{shared_path}/storage/framework/views"
            execute "mkdir #{shared_path}/storage/logs"
            execute :chmod, "-R 777 #{shared_path}/storage"
        end
    end
    task :create_school_image_folder do
        on roles(:all) do
            execute "mkdir #{shared_path}/file"
            execute :chmod, "-R 777 #{shared_path}/file/"
        end
    end

    task :create_export_folder do
        on roles(:all) do
            execute "mkdir #{shared_path}/export"
            execute :chmod, "-R 777 #{shared_path}/export/"
        end
    end

    desc "Symbolic link for shared folders"
    task :create_symlink do
        on roles(:app) do
            within release_path do
                execute "rm -rf #{release_path}/storage"
                execute "ln -s #{shared_path}/storage/ #{release_path}"
                execute "ln -s #{shared_path}/file #{release_path}/public"
                execute "ln -s #{shared_path}/export #{release_path}/public"
            end
        end
    end

    desc "Run Laravel Artisan migrate task."
    task :migrate do
        on roles(:app) do
            within release_path do
                execute :php, "artisan migrate --force"
            end
        end
    end

    desc "Run Laravel Artisan seed task."
    task :seed do
        on roles(:app) do
            within release_path do
            execute :php, "artisan db:seed --force"
            end
        end
    end

    desc "Optimize Laravel Class Loader"
    task :optimize do
        on roles(:app) do
            within release_path do
                execute :php, "artisan clear-compiled"
                execute :php, "artisan optimize"
            end
        end
    end

    desc "Create ver.txt"
    task :create_ver_txt do
        on roles(:all) do
            puts ("--> Copying ver.txt file")
            execute "cp #{release_path}/config/deploy/ver.txt.example #{release_path}/public/ver.txt"
            execute "sed --in-place 's/%date%/#{fetch(:current_time)}/g
                        s/%branch%/#{fetch(:branch)}/g
                        s/%revision%/#{fetch(:current_revision)}/g
                        s/%deployed_by%/#{fetch(:user)}/g' #{release_path}/public/ver.txt"
            execute "find #{release_path}/public -type f -name 'ver.txt' -exec chmod 664 {} \\;"
        end
    end

    desc "Set up project"
    task :set_up do
        on roles(:all) do
            invoke "sida:create_storage_folder"
            invoke "sida:create_school_image_folder"
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

namespace :nginx do
    desc 'Reload nginx server'
        task :reload do
            on roles(:all) do
            execute :sudo, :service, "nginx reload"
        end
    end
end

namespace :php5_fpm do
    desc 'Restart php5-fpm'
        task :restart do
            on roles(:all) do
            execute :sudo, :service, "php5-fpm restart"
        end
    end
end

namespace :deploy do
    after :starting, "hipchat:start"
    after :updated, "vendor:copy"
    after :updated, "composer:install"
    after :updated, "environment:set_variables"
    after :published, "sida:create_symlink"
    after :finished, "hipchat:deployed"
    after :finished, "sida:create_ver_txt"
    after :failed, "hipchat:notify_deploy_failed"
end

after "deploy",   "nginx:reload"
after "deploy",   "php5_fpm:restart"
