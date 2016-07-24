import {spawn} from "child_process";
import {carry} from "carrier";
import EventEmitter from "events";
import {resolve} from "path";
import {existsSync, appendFileSync, readFileSync} from "fs";

const capistrano = () => {

    const eventEmitter = new EventEmitter();

    const streamResult = command => {
        const output = carry(command.stdout);
        const error = carry(command.stderr);
        let onError = false;
     
        output.on('line', line => {
            eventEmitter.emit('running', line);
        });

        output.on('end', () => {
            if (!onError) eventEmitter.emit('finish');
            eventEmitter.removeAllListeners('running');
            eventEmitter.removeAllListeners('finish');
        });

        error.on('line', line => {
            onError = true;
            eventEmitter.emit('error', line);
        });
        
        error.on('end', () => {
            eventEmitter.removeAllListeners('error');
        });
    };

    return {
        deploy(projectPath, branch, stage, user = null) {
            const command = spawn('cap', [stage, "deploy", `branch=${branch}`, `user=${user && user.name || 'haku'}`], {cwd: projectPath});
            streamResult(command);

            return this;
        },
        isConfigured(projectPath)
        {
            return existsSync(`${projectPath}/Capfile`);
        },
        on(event, callback){
            eventEmitter.on(event, callback);

            return this;
        }
    };
};

export default capistrano();
