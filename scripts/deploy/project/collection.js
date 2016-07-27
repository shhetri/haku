import config from "../../config";
import forOwn from "lodash/forOwn";
import project from "./project";

const collection = () => {
    return {
        /**
         * Get all the projects
         * @returns {Array}
         */
        all(){
            const projects = config.get('projects');
            let projectCollection = [];

            forOwn(projects, (config, projectName) => {
                projectCollection.push(project({...config, name: projectName}));
            });

            return projectCollection;
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

            if (!projectConfiguration) throw Error(`Project with name ${name} is not available`);

            return project({...projectConfiguration, name});
        }
    }
};

export default collection();
