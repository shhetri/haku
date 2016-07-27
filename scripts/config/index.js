import ReConfig from "reconfig";

export const DEPLOYMENT_CAPISTRANO = 'capistrano';
export const DEPLOYMENT_FABRIC = 'fabric';

const config = {
    projects: {
        sida: {
            repoUrl: 'http://gitlab.yipl.com.np/web-apps/sida',
            stagingUrl: 'http://sida.yipl.com.np',
            provider: DEPLOYMENT_CAPISTRANO,
            allowedRooms: ['sida-wb'],
            environments: {
                staging: {
                    allowedUsers: ['Kushal', 'DikenUlak', 'sumit', 'PrashantShrestha']
                }
            }
        },
        sida_algorithm: {
            repoUrl: 'http://gitlab.yipl.com.np/web-apps/sida-algorithm',
            provider: DEPLOYMENT_CAPISTRANO,
            allowedRooms: ['sida-wb'],
            environments: {
                staging: {
                    allowedUsers: ['sumit', 'PrashantShrestha']
                }
            }
        }
    },
    hakuLines: {
        bal: 'bal hoina pasa dimag laga dimag',
        dheraiDin: 'ramro sanga command han dherai din banch chhas',
        ktmSahar: 'Kathmandu sahar herda lagchha rahara, giddai gidda ko sahara',
        projectPayena: ':project naam ko project ta payena hai @:username pasa',
        projectOrEnvPayena: 'project or environment chai milena hai @:username pasa',
        masterPlan: 'Master plan ma kaam garne bhayis @:username pasa',
        sshKeyPayena: 'pasa, ssh key ta payena.'
    }
};

export default new ReConfig(config);
