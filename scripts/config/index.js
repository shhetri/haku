import downloader from "./downloader";
import converter from "./converter";
import Reconfig from "reconfig";
import {arrayOfObjectsToObject, configureMaintenance} from "../helpers";
import {resolve} from "path";
import isString from "lodash/isString";
import setInObject from "lodash/set";

const PROJECTS_GOOGLE_SHEET_DOWNLOAD_LINK = 'https://docs.google.com/spreadsheets/d/17TH75ANUMiAuuA_cakz_gNUub0ulPR8jWMUO40TtpEg/export?format=csv';
const CONFIG_REFRESH_TIME = 5 * 60 * 1000; // Five minute

export const MAINTENANCE_CRON_TIME = '00 00 00 * * *'; // Every day at 12:00 AM
export const HOME_DIRECTORY = process.env.HOME;
export const PROJECTS_DIRECTORY = resolve(HOME_DIRECTORY, './projects');
export const DEPLOYMENT_CAPISTRANO = 'capistrano';
export const DEPLOYMENT_FABRIC = 'fabric';

const defaultConfig = {
    projects: {},
    hakuLines: {
        bal: 'bal hoina pasa dimag laga dimag',
        dheraiDin: 'ramro sanga command han dherai din banch chhas',
        ktmSahar: 'Kathmandu sahar herda lagchha rahara, giddai gidda ko sahara',
        projectPayena: ':project naam ko project ta payena hai pasa',
        projectOrEnvPayena: 'project or environment chai milena hai @:username pasa',
        masterPlan: 'Master plan ma kaam garne bhayis @:username pasa',
        sshKeyPayena: 'ssh key ta harayo',
        herumProjectList: 'La herum projects ko list',
        projectsChaina: 'Lya projects nai chaina raicha',
        herumRoomKoProjectList: 'La herum yo room ma vayeko projects ko list',
        deployTarika: 'La pasa yesari hanne Deploy command',
        deployFailVayo: 'Deploy ta fail vayo',
        invalidProvider: '{{ hakuLines.bal }}. Jpt deploy provider use nagar'
    }
};

const manager = () => {
    let reConfig = new Reconfig(defaultConfig);

    /**
     * Since Reconfig doesn't provide replace feature, this is a proxy object to Reconfig with
     * replace functionality
     */
    const config = {
        /**
         * Replace the value of the key in the config object and reinitialize the reconfig
         *
         * @param key
         * @param value
         */
        replace(key, value){
            if (!(key && isString(key) && value)) {
                return;
            }

            const config = setInObject(reConfig.get(), key, value);
            reConfig = new Reconfig(config);
        },

        /**
         * Proxy method to Reconfig get
         *
         * @param args
         * @returns {*}
         */
        get(...args){
            return reConfig.get(...args);
        },

        /**
         * Proxy method to Reconfig set
         *
         * @param args
         * @returns {*}
         */
        set(...args){
            return reConfig.set(...args);
        }
    };

    /**
     * Merge the fresh project configuration to the reconfig instance
     * @param err
     * @param projectsConfig
     */
    const mergeProjectsConfig = (err, projectsConfig) => {
        if (err) {
            throw new Error(err);
        }

        projectsConfig = arrayOfObjectsToObject(projectsConfig, 'name');
        config.replace('projects', projectsConfig);
    };

    /**
     * Load the projects configuration from csv
     */
    const loadProjectsConfig = () => {
        const projectConverter = converter.forProject();
        const convertToJson = csv => {
            projectConverter.fromString(csv, mergeProjectsConfig);
        };

        downloader.download(PROJECTS_GOOGLE_SHEET_DOWNLOAD_LINK, convertToJson);
    };

    /**
     * Periodically refresh the configuration
     *
     * @param time
     */
    const refreshConfigIn = time => {
        setInterval(() => loadProjectsConfig(), time);
    };

    loadProjectsConfig();
    refreshConfigIn(CONFIG_REFRESH_TIME);
    configureMaintenance();

    return config;
};

export default manager();
