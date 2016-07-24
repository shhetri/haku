import config, {DEPLOYMENT_CAPISTRANO} from "../../config";
import {capistrano} from "../provider";
import request from "request";
import {normalizeUrl} from "../../helpers";

const project = ({repoUrl, provider, allowedRooms, environments, name})=> {
    const validate = () => {
        if (!(repoUrl && provider && allowedRooms && environments && name)) throw Error('Invalid config for the project');
    };

    validate();

    return {
        name,
        repoUrl,
        isAllowedInRoom(room){
            return allowedRooms.includes(room);
        },
        isDeployable(stage){
            return environments.includes(stage);
        },
        getProvider(){
            if (provider === DEPLOYMENT_CAPISTRANO) {
                return capistrano;
            }
        },
        getCompareUrl(branch){
            return `${normalizeUrl(repoUrl)}/compare/master.../${branch}`;
        },
        requestDeployedVersion(stage, responseHandler){
            const url = config.get(`projects.${name}.${stage}Url`);
            if (!url) throw new Error('Environment Url not found');
            const versionTxtUri = 'ver.txt';
            const requestUrl = `${normalizeUrl(url)}/${versionTxtUri}`;

            request(requestUrl, responseHandler);
        }
    }
};

export default project;
