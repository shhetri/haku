// Description:
//   Hubot script to deploy a project to a stage.
//
// Commands:
//   hubot list projects - List the projects that can be deployed by me
//   hubot list projects in room - List the projects in the room that can be deployed by me
//   hubot deploy <project>:<branch> to <stage> - Deploy a project to given stage
//   hubot deploy help : Give examples of deploy command
//   hubot ver <app> <env> - Know which tag/branch is deployed by whom and when!
//
// Author:
//   Sumit Chhetri <sumit.chhetri@yipl.com.np>

import {listsProjects, listsProjectsInRoom, deployHelp, deploy, version} from "./deploy/response";

export default robot => {
    robot.respond(/deploy( help)?$/i, res => deployHelp(res, robot));
    robot.respond(/list projects$/i, res => listsProjects(res, robot));
    robot.respond(/list projects in room/i, res => listsProjectsInRoom(res, robot));
    robot.respond(/deploy([\s]+(?!(?:help$))[\w-\/]+)[:@]?([\w-]*?)(?:[\s]?)+(?:to([\s]+[\w-\/]+[\s]*?))?$/i, res => deploy(res, robot));
    robot.respond(/(ver) (.*)/i, res => version(res, robot));
};
