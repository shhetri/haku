// Description:
//   Hubot script that displays the public ssh key of hubot server.
//
// Commands:
//   hubot public key - Displays the public ssh key of hubot server
//   hubot ssh key - Displays the public ssh key of hubot server
//
// Author:
//   Sumit Chhetri <sumit.chhetri@yipl.com.np>

import {readFile} from "fs";
import {resolve} from "path";
import config from "./config";

export default robot => {
    robot.respond(/(public|ssh)\s+key(\s+)?$/i, res => {
        const HOME = process.env.HOME;
        const publicSshPath = resolve(HOME, "./.ssh/id_rsa.pub");
        readFile(publicSshPath, 'utf8', (err, publicSshKey) => {
            if (err) {
                robot.logger.error(err);
                res.reply(config('hakuLines.sshKeyPayena'));

                return;
            }

            res.send(publicSshKey);
        });
    });
};
