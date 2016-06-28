import Project from "./Project";

class ProjectContainer {
    constructor() {
        this.projects = {};
    }

    newProject(name, json) {
        this.projects[name] = new Project(name, json);
    }

    get(projectName) {
        if (!this.projects[projectName]) {
            return new Project('fake', false, false);
        }

        return this.projects[projectName];
    }
}

export default ProjectContainer;
