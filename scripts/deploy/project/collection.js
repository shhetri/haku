import config from "../../config";
import forOwn from "lodash/forOwn";
import project from "./project";

const collection = () => {
    return {
        all(){
            const projects = config.get('projects');
            let projectCollection = [];

            forOwn(projects, (config, projectName) => {
                projectCollection.push(project({...config, name: projectName}));
            });

            return projectCollection;
        },
        getInRoom(room){
            const projects = this.all();

            return projects.filter(project => project.isAllowedInRoom(room));
        },
        findByName(name){
            const projectConfiguration = config.get('projects')[name];

            if (!projectConfiguration) throw Error(`Project with name ${name} is not available`);

            return project({...projectConfiguration, name});
        }
    }
};

export default collection();
