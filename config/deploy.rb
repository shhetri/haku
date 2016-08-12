lock '3.5.0'

# Application #
#####################################################################################
set :application,     'haku'
set :branch,          ENV["branch"] || "master"
set :user,            ENV["user"] || ENV["USER"] || "haku"
set :tmp_dir,         '/home/haku/tmp'


# SCM #
#####################################################################################
set :repo_url,        'git@github.com:shhetri/haku.git'
set :scm,             :git

# Multistage Deployment #
#####################################################################################
set :stages,              %w(production)
set :default_stage,       "production"


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
set :keep_releases,       3

namespace :npm do
    desc "Running node Install"
    task :install do
        on roles(:app) do
            within release_path do
                execute :npm, "install"
            end
        end
    end
end

namespace :node_modules do
    desc 'Copy node_modules directory from last release'
    task :copy do
        on roles(:app) do
            puts ("--> Coping node_modules folder from previous release")
            execute "nodeModulesDir=#{current_path}/node_modules; if [ -d $nodeModulesDir ] || [ -h $nodeModulesDir ]; then cp -a $nodeModulesDir #{release_path}/node_modules; fi;"
        end
    end
end

namespace :haku do
    desc 'Reload haku the hubot'
        task :restart do
            on roles(:app) do
            execute :sudo, :service, "hubot-haku restart"
        end
    end
end

namespace :setup do
    desc 'Create projects folder'
        task :create_projects_folder do
            on roles(:app) do
            execute "mkdir -p #{fetch(:projects_path)}"
        end
    end
end

namespace :deploy do
    after :updated, "node_modules:copy"
    after :updated, "npm:install"
end

after "deploy", "haku:restart"
