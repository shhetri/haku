import ReConfig from "reconfig";

export const DEPLOYMENT_CAPISTRANO = 'capistrano';
export const DEPLOYMENT_FABRIC = 'fabric';

const config = {
    projects: {
        blog: {
            repoUrl: 'https://github.com/shhetri/blog',
            provider: DEPLOYMENT_CAPISTRANO,
            allowedRooms: ['deploy_room'],
            environments: ['staging']
        },
        blogging: {
            repoUrl: 'https://github.com/shhetri/blog',
            provider: DEPLOYMENT_CAPISTRANO,
            allowedRooms: ['deploy_room'],
            environments: ['staging']
        }
    }
};

export default new ReConfig(config);
