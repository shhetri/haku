import cjson from "cjson";

class Project {
    constructor(name, jsonPath, exists = true) {
        this.name = name;
        this.jsonPath = jsonPath;
        this.exists = exists;
        this.users = [];

        this.updateUsers();
        setInterval(()=> {
            this.updateUsers()
        }, 1000);
    }

    hasUser(user) {
        return this.users.includes(user);
    }

    getUsers() {
        return this.users.join(', ');
    }

    updateUsers() {
        if (this.jsonPath) {
            const json = cjson.load(this.jsonPath);
            this.users = json.users;
        }
    }
}

export default Project;
