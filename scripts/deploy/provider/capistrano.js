import {spawn} from "child_process";
import {existsSync} from "fs";
import {resolve} from "path";
import {gitClone, gitPull, capDeploy} from "../../helpers/commands";
import executeInSeries from "async/series";
import config from "../../config";

const capistrano = () => {
    return {
        /**
         * Deploy the project using capistrano
         *
         * @param project
         * @param branch
         * @param stage
         * @param user
         * @returns {function(this:deploy)}
         */
        deploy(project, branch, stage, user = null) {
            /**
             * If the project doesn't exist in the projects directory, we clone it in
             * projects directory and then only run deploy command.
             */
            if (!existsSync(project.path())) {
                return (onStart, onSuccess, onError, onRunning) => {
                    const commands = [
                        gitClone(project, onError, onRunning),
                        capDeploy(project, branch, stage, user, onSuccess, onError, onRunning)
                    ];
                    onStart();
                    executeInSeries(commands, err => err && onError(config.get('hakuLines.deployFailVayo')));
                };
            }

            /**
             * If the project exists in the projects directory, we pull the latest changes and run deploy command
             */
            return (onStart, onSuccess, onError, onRunning) => {
                const commands = [
                    gitPull(project, onError, onRunning),
                    capDeploy(project, branch, stage, user, onSuccess, onError, onRunning)
                ];
                onStart();
                executeInSeries(commands, err => err && onError(config.get('hakuLines.deployFailVayo')));
            };
        }
    };
};

export default capistrano();
