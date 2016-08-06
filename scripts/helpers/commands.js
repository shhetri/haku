import config, {PROJECTS_DIRECTORY} from "../config";
import {spawn} from "child_process";
import {carry} from "carrier";
import keys from "lodash/keys";
import difference from "lodash/difference";
import {readdirSync, statSync} from "fs";
import path from "path";
import rimraf from "rimraf";

/**
 * Returns a function that runs git clone command and streams the output
 *
 * @param project
 * @param onError
 * @param onRunning
 * @returns {function(*=)}
 */
export const gitClone = (project, onError, onRunning) => {
    return callback => {
        try {
            const command = spawn('git', ["clone", "--depth=1", project.repoUrl, project.name, '-q'], {cwd: PROJECTS_DIRECTORY});
            streamOutput(command, null, onError, onRunning, callback);
        } catch (err) {
            console.error(err);
            callback(err);
        }
    };
};

/**
 * Returns a function that runs git pull command and streams the output
 *
 * @param project
 * @param onError
 * @param onRunning
 * @returns {function(*=)}
 */
export const gitPull = (project, onError, onRunning) => {
    return callback => {
        try {
            const command = spawn('git', ["pull", "origin", "master", '-q'], {cwd: project.path()});
            streamOutput(command, null, onError, onRunning, callback);
        } catch (err) {
            console.error(err);
            callback(err);
        }
    };
};

/**
 * Returns a function that runs capistrano deploy command and streams the output
 *
 * @param project
 * @param branch
 * @param stage
 * @param user
 * @param onSuccess
 * @param onError
 * @param onRunning
 * @returns {function(*=)}
 */
export const capDeploy = (project, branch, stage, user, onSuccess, onError, onRunning) => {
    return callback => {
        try {
            const command = spawn('cap', [stage, "deploy", `branch=${branch}`, `user=${user && user.name || 'haku'}`], {cwd: project.path()});
            streamOutput(command, onSuccess, onError, onRunning, callback);
        } catch (err) {
            console.error(err);
            callback(err);
        }
    };
};

/**
 * Stream the output of the command. And call the callbacks onSuccess, onError, onRunning and next if provided.
 * The next callback is used if the command is running in async series which decides whether to run next command or
 * not.
 *
 * @param command ChildProcess
 * @param onSuccess function
 * @param onError function
 * @param onRunning function
 * @param next function
 */
export const streamOutput = (command, onSuccess, onError, onRunning, next) => {
    const output = carry(command.stdout);
    const error = carry(command.stderr);
    let isError = false;

    output.on('line', line => {
        onRunning && onRunning(line);
    });
    output.on('end', () => {
        if (!isError) {
            onSuccess && onSuccess();
            next && next(null);

            return;
        }

        next && next(true);
    });

    error.on('line', line => {
        isError = true;
        onError && onError(line);
    });
};

/**
 * Get the directories name from the provided path
 *
 * @param rootPath
 */
export const getDirectories = rootPath => readdirSync(rootPath).filter(file => statSync(path.join(rootPath, file)).isDirectory());

/**
 * Remove the stale projects
 */
export const removeStaleProjects = () => {
    const projectsInConfig = keys(config.get('projects'));
    const projectsInDirectory = getDirectories(PROJECTS_DIRECTORY);
    const staleProjects = difference(projectsInDirectory, projectsInConfig);

    staleProjects.forEach(project => {
        rimraf(path.join(PROJECTS_DIRECTORY, project), {disableGlob: true}, err => {
            if (err) console.error(`Error deleting project directory : ${project}`, err);
        })
    });
};
