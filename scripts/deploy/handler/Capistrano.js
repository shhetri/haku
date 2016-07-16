import {spawn} from 'child_process';
import carrier from 'carrier';

class Capistrano {
	execute(projectPath, branch, stage, res){
		const cap = spawn('cap', [stage, "deploy", `branch=${branch}`], {cwd: projectPath});	
		this.streamResult(cap, res);
	}

	streamResult(cap, res){
		const capOut = carrier.carry(cap.stdout);
		const capErr = carrier.carry(cap.stderr);

		capOut.on('line', line => {
			res.reply(line);
		});

		capErr.on('line', line => {
			res.reply(line);
		});
	}
}

export default Capistrano;
