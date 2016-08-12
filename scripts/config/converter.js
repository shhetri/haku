import {Converter} from "csvtojson";
import {stringToArray} from "../helpers";

/**
 * Convert csv to json
 * @returns {*}
 */
const converter = () => {
    return {
        /**
         * Get the converter for the project configuration. It overrides the header with defaults and also
         * adds a transformer to manipulate the json object for each project.
         *
         * @returns Converter
         */
        forProject(){
            const converter = new Converter({
                checkType: false,
                headers: ["name", "repoUrl", "provider", "allowedRooms", "stagingUrl", "environments.staging.allowedUsers", "environments.staging.notAllowedUsers", "productionUrl", "environments.production.allowedUsers", "environments.production.notAllowedUsers"]
            });

            converter.transform = project => {
                project["name"] = project["name"].trim();
                project["repoUrl"] = project["repoUrl"].trim();
                project["stagingUrl"] = project["stagingUrl"].trim();
                project["productionUrl"] = project["productionUrl"].trim();
                project["allowedRooms"] = stringToArray(project["allowedRooms"]);
                project["environments"]["staging"]["allowedUsers"] = stringToArray(project["environments"]["staging"]["allowedUsers"]);
                project["environments"]["staging"]["notAllowedUsers"] = stringToArray(project["environments"]["staging"]["notAllowedUsers"]);
                project["environments"]["production"]["allowedUsers"] = stringToArray(project["environments"]["production"]["allowedUsers"]);
                project["environments"]["production"]["notAllowedUsers"] = stringToArray(project["environments"]["production"]["notAllowedUsers"]);
            };

            return converter;
        }
    }
};

export default converter();
