import {projectCollection} from "../project";
import {resolve} from "path";

export const listsProjects = res => {
    const projects = projectCollection.all();

    if (projects.length) {
        return res.send(`List of projects: ${'\n *'} ${projects.map(project => project.name).join('\n * ')}`);
    }

    res.send('List of projects: No projects available.');
};

export const listsProjectsInRoom = res => {
    const projects = projectCollection.getInRoom(res.envelope.room);

    if (projects.length) {
        return res.send(`List of projects in this room: ${'\n *'} ${projects.map(project => project.name).join('\n * ')}`);
    }

    res.send('List of projects: No projects available in this room.');
};

export const deployHelp = res => {
    res.send('Deploy Examples:');
    res.send('deploy blog to staging');
    res.send('deploy blog:BL-20 to production (note: BL-20 is the branch name)');
    res.send('note: branch defaults to master');
};

export const deploy = res => {
    const projectName = (res.match[1] || '').trim();
    let branch = (res.match[2] || '').trim() || 'master';
    let stage = (res.match[3] || '').trim() || 'staging';
    const room = res.envelope.room;

    try {
        const project = projectCollection.findByName(projectName);

        if (!project.isAllowedInRoom(room)) {
            return res.reply(`You can't deploy ${projectName} from this room.`);
        }

        if (!project.isDeployable(stage)) {
            return res.reply(`${projectName} cannot be deployed in ${stage}`);
        }

        const projectPath = resolve(__dirname, "../project", `./${projectName}`);
        const deployProvider = project.getProvider();

        if (deployProvider.isConfigured(projectPath)) {
            res.reply(`is deploying ${projectName}/${branch} to ${stage} (compare: ${project.getCompareUrl(branch)})`);

            deployProvider.deploy(projectPath, branch, stage)
                .on('error', line => {
                    res.send(line);
                })
                .on('finish', () => {
                    const user = res.envelope.user || res.envelope;
                    res.send(`@${user.mention_name}'s ${stage} deployment of ${projectName}/${branch} is done!`);
                });

            return;
        }

        res.reply(`Please setup capistrano configurations for ${projectName}`);
    } catch (e) {
        res.reply(e.message);
    }
};
