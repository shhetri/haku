import config from "../../config";
import values from "lodash/values";
import project from "./project";

const collection = () => {
    return {
        /**
         * Get all the projects
         * @returns {Array}
         */
        all(){
            return values(config.get('projects')).map(projectConfiguration => project(projectConfiguration));
        },

        /**
         * Get projects that is available in the provided room
         * @param room
         * @returns Array
         */
        getInRoom(room){
            const projects = this.all();

            return projects.filter(project => project.isAllowedInRoom(room));
        },

        /**
         * Find the project by its name
         * @param name
         * @returns {{name, repoUrl, isAllowedInRoom, isDeployable, getProvider, getCompareUrl, requestDeployedVersion}}
         */
        findByName(name){
            const projectConfiguration = config.get('projects')[name];

            if (!projectConfiguration) throw Error(config.get('hakuLines.projectPayena', {project: name}));

            return project(projectConfiguration);
        }
    }
};

export default collection();
