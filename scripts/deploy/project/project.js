import config, {DEPLOYMENT_CAPISTRANO, PROJECTS_DIRECTORY} from "../../config";
import {capistrano} from "../provider";
import request from "request";
import {normalizeUrl} from "../../helpers";
import has from "lodash/has";
import isEmpty from "lodash/isEmpty";
import {resolve} from "path";

const project = ({repoUrl, provider, allowedRooms, environments, name})=> {
    /**
     * Validate the config for the project
     */
    if (!(repoUrl && provider && allowedRooms && environments && name)) throw Error('Invalid config for the project');

    /**
     * Check if the project can be deployed in the provided stage by provided user
     * @param stage
     * @param userName
     * @returns {boolean}
     */
    const canDeployIn = (stage, userName) => {
        if (!has(environments, stage)) return false;
        if (isEmpty(environments[stage])) return true;
        if (!isEmpty(environments[stage].allowedUsers)) {
            return environments[stage].allowedUsers.includes(userName);
        }

        return isEmpty(environments[stage].notAllowedUsers) || !environments[stage].notAllowedUsers.includes(userName);
    };

    return {
        /**
         * Name of the project
         */
        name,

        /**
         * Repo url of the project
         */
        repoUrl,

        /**
         * Check if the project is allowed in the given room
         * @param room
         * @returns {boolean}
         */
        isAllowedInRoom(room){
            return allowedRooms.includes(room);
        },

        /**
         * Check if the project is deployable
         * @param stage
         * @param user
         * @returns {boolean}
         */
        isDeployable(stage, user){
            if (Array.isArray(environments)) {
                return environments.includes(stage);
            }

            return canDeployIn(stage, user.mention_name);
        },

        /**
         * Get the deployment provider for the project
         * @returns {{deploy}}
         */
        getProvider(){
            if (provider === DEPLOYMENT_CAPISTRANO) {
                return capistrano;
            }

            throw new Error(config.get('hakuLines.invalidProvider'));
        },

        /**
         * Get the compare url of the project for the given branch
         * @param branch
         * @returns {string}
         */
        getCompareUrl(branch){
            const re = /git@(.+):(.+).git$/;
            const repoWebUrl = repoUrl.replace(re, 'http://$1/$2');

            return `${normalizeUrl(repoWebUrl)}/compare/master.../${branch}`;
        },

        /**
         * Get the content of ver.txt file of the project for given stage
         * @param stage
         * @param responseHandler
         */
        requestDeployedVersion(stage, responseHandler){
            const url = config.get(`projects.${name}.${stage}Url`);
            if (!url) throw new Error('Environment Url not found');
            const versionTxtUri = 'ver.txt';
            const requestUrl = `${normalizeUrl(url)}/${versionTxtUri}`;

            request(requestUrl, responseHandler);
        },

        /**
         * Return the project path
         *
         * @returns string
         */
        path(){
            return resolve(PROJECTS_DIRECTORY, `./${name}`);
        }
    }
};

export default project;
