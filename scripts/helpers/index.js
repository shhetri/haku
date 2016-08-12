import zipObject from "lodash/zipObject";
import map from "lodash/map";
import {CronJob} from "cron";
import {MAINTENANCE_CRON_TIME} from "../config";
import {removeStaleProjects} from "../helpers/commands";

/**
 * Omit special characters from the string
 * @param string
 */
export const escape = string => undefined === string ? null : string.replace(/[^a-zA-Z0-9\-\_\.\ ]/g, '');

/**
 * Remove trailing slash(/) from the url
 * @param url
 */
export const normalizeUrl = url => url.replace(/\/+$/, "");

/**
 * Get the user from the response
 * @param res
 */
export const getUser = res => res.envelope.user || res.envelope;

/**
 * Get the room of the chat application from the response
 * @param res
 */
export const getRoom = res => res.envelope.room;

/**
 * Convert string to array.
 *
 * @param string
 * @param separator
 * @param rejectEmpty
 * @returns {Array}
 */
export const stringToArray = (string, separator = ',', rejectEmpty = true)=> {
    const array = string.split(separator).map(item => item.trim());

    if (rejectEmpty) {
        return array.filter(item => !!item)
    }

    return array;
};

/**
 * Convert Array of Objects to Object of Objects
 *
 * @param arrayOfObjects
 * @param key The key in the object whose value should be used as the key of that whole object
 */
export const arrayOfObjectsToObject = (arrayOfObjects, key) => {
    return zipObject(map(arrayOfObjects, key), arrayOfObjects);
};

/**
 * Configure maintenance mode
 */
export const configureMaintenance = () => {
    const job = new CronJob({
        cronTime: MAINTENANCE_CRON_TIME,
        onTick(){
            removeStaleProjects();
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });

    job.start();
};
