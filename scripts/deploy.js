// Description:
//   Hubot script to deploy a project to a stage.
//
// Commands:
//   hubot list projects - List the projects that can be deployed by me
//   hubot list projects in room - List the projects in the room that can be deployed by me
//   hubot deploy <project>:<branch> to <stage> - Deploy a project to given stage
//   hubot deploy help : Give examples of deploy command
//
// Author:
//   Sumit Chhetri <sumit.chhetri@yipl.com.np>

import {listsProjects, listsProjectsInRoom, deployHelp, deploy} from "./deploy/response";

export default robot => {
    robot.respond(/deploy( help)?$/i, deployHelp);
    robot.respond(/list projects$/i, listsProjects);
    robot.respond(/list projects in room/i, listsProjectsInRoom);
    robot.respond(/deploy([\s]+[\w-\/]+)[:@]?([\w-]*?)[\s]+to([\s]+[\w-\/]+[\s]*?)?$/i, deploy);

    robot.error((err, res) => {
        robot.logger.error(err);

        if (res) {
            res.reply("Something went wrong");
        }
    });
};
