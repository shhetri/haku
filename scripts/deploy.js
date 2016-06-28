// Description:
//   Hubot script to deploy a project to a stage.
//
// Commands:
//   hubot list projects - List the projects that can be deployed by me
//   hubot deploy <project>:<branch> to <stage> - Deploy a project to given stage
//   hubot deploy help : Give examples of deploy command
//
// Author:
//   Sumit Chhetri <sumit.chhetri@yipl.com.np>

import FolderReader from "./deploy/handler/FolderReader";
import PermissionHandler from "./deploy/handler/PermissionHandler";
import Capistrano from "./deploy/handler/Capistrano";
import fs from "fs";
import path from "path";

if (!process.env.HUBOT_CAP_DIR) {
    throw new Error('You must define the env HUBOT_CAP_DIR');
}

const folder = new FolderReader(process.env.HUBOT_CAP_DIR);
const permission = new PermissionHandler(folder);
const cap = new Capistrano();

export default robot => {
    robot.hear(/hello/, res => {
       res.emote('says Hi!');
    });

    robot.respond(/deploy( help)?$/i, res => {
        res.reply('deploy blog in staging');
        res.reply('deploy blog:BL-20 in staging');
        res.reply('note: branch defaults to master');
    });

    robot.hear(/list projects/i, res => {
        res.send(`Project list: ${folder.getProjects().join(', ')}`);
    });

    robot.respond(/deploy([\s]+[\w-\/]+)[:@]?([\w-]*?)[\s]+to([\s]+[\w-\/]+[\s]*?)?$/i, res => {
        const project = (res.match[1] || '').trim();
        let branch = (res.match[2] || '').trim();
        let stage = (res.match[3] || '').trim();
        const username = res.message.user.room.split('@')[0];
        // set default value if value is not specified
        stage = stage === '' ? 'staging' : stage;
        branch = branch === '' ? 'master' : branch;

        if (!folder.projectExists(project)) {
            return res.reply("This project doesn't exists.");
        }

        if (!permission.hasPermission(username, project)) {
            res.reply("You don't have permission in this project");

            if (permission.getUsers(project).length > 0) {
                res.reply(`Please talk with ${permission.getUsers(project)}`);
            }

            return false;
        }

        const projectPath = path.resolve(__dirname, ".", `deploy/project/${project}`);

        if (fs.existsSync(`${projectPath}/Capfile`)) {
            res.reply(`Starting the deployment of ${project}`);
            cap.execute(projectPath, branch, stage, res);
        } else {
            res.reply(`Please set up capistrano configurations in ${projectPath}/capistrano`);
        }
    });

    robot.error((err, res) => {
        robot.logger.error(err);

        if (res) {
            res.reply("Something went wrong");
        }
    });
};
