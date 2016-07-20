import {DEPLOYMENT_CAPISTRANO} from "../config";
import {capistrano} from "../provider";

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
            return `${repoUrl}/compare/master.../${branch}`;
        }
    }
};

export default project;
