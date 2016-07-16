import fs from "fs";

class FolderReader {
    constructor(path) {
        this.path = path;
        this.folders = [];
        this.readFolders();
        
        setInterval(() => this.readFolders(), 1000);
    }

    readFolders() {
        fs.readdir(this.path, (err, folders) => {
            if (err) {
                throw new Error(err);
            }

            this.folders = [];
            this.filterFolders(folders);
        });
    }

    filterFolders(folders) {
        folders.forEach(folder => {
            fs.stat(this.path + folder, (err, stat) => {
                if (err) {
                    throw new Error(err);
                }

                if (stat.isDirectory()) {
                    this.folders.push(folder);
                }
            });
        });
    }

    exists(path, callback) {
        fs.exists(path, exists => {
            callback(exists);
        });
    }

    projectExists(project) {
        return this.folders.includes(project);
    }

    getPath() {
        return this.path;
    }

    getProjects() {
        return this.folders;
    }
}

export default FolderReader;
