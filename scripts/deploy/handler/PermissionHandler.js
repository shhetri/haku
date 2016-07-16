import ProjectContainer from "../project/ProjectContainer";

class PermissionHandler {
    constructor(folderReader) {
        this.folderReader = folderReader;
        this.projects = new ProjectContainer();
    }

    hasPermission(user, project) {
        this.searchProject(this.folderReader.getPath() + project, project);
        return this.projects.get(project).hasUser(user);
    }

    searchProject(path, project) {
        if (this.projects.get(project).exists) {
            return true;
        }

        this.folderReader.exists(path, exists => {
            if (exists) {
                this.createProject(path, project);
            }
        });
    }

    getUsers(project) {
        return this.projects.get(project).getUsers(project);
    }

    createProject(path, project) {
        const jsonPath = `${path}/users.json`;
        this.folderReader.exists(jsonPath, exists => {
            if (exists) {
                this.projects.newProject(project, jsonPath);
            }
        })
    }
}

export default PermissionHandler;
