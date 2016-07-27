import {projectCollection} from "../project";
import {resolve} from "path";
import config from "../../config";
import {escape, getUser, getRoom} from "../../helpers";

/**
 * List all the projects that are configured in haku for deployment
 * @param res
 */
export const listsProjects = res => {
    const projects = projectCollection.all();

    if (projects.length) {
        return res.send(`La herum pasa projects ko list: ${'\n *'} ${projects.map(project => project.name).join('\n * ')}`);
    }

    res.send('La herum pasa projects ko list : Lya projects nai chaina raicha.');
};

/**
 * List all the projects that can be deployed from a particular room
 * @param res
 */
export const listsProjectsInRoom = res => {
    const projects = projectCollection.getInRoom(getRoom(res));

    if (projects.length) {
        return res.send(`La herum pasa yo room ma vayeko projects ko list: ${'\n *'} ${projects.map(project => project.name).join('\n * ')}`);
    }

    res.send('La herum pasa yo room ma vayeko projects ko list: Lya projects nai chaina raicha.');
};

/**
 * List some examples of how to deploy a project
 * @param res
 */
export const deployHelp = res => {
    res.send('La pasa yesari hanne Deploy command');
    res.send('deploy blog to staging');
    res.send('deploy blog:BL-20 to production (note: BL-20 is the branch name)');
    res.send('deploy blog@BL-20 to staging (note: BL-20 is the branch name)');
    res.send('deploy blog (note: branch defaults to master and stage defaults to staging)');
};

/**
 * Deploy a project
 * @param res
 * @param robot
 */
export const deploy = (res, robot) => {
    const user = getUser(res);
    const projectName = (res.match[1] || '').trim();
    const branch = (res.match[2] || '').trim() || 'master';
    const stage = (res.match[3] || '').trim() || 'staging';

    try {
        const project = projectCollection.findByName(projectName);

        if (!project.isAllowedInRoom(getRoom(res))) {
            return res.reply(`${config.get('hakuLines.bal')}, ${projectName} lai yo room bata deploy garna nakhoj.`);
        }

        if (!project.isDeployable(stage, user)) {
            res.reply(`${config.get('hakuLines.bal')}, ${projectName} lai ${stage} ma deploy garna nakhoj.`);
            res.send(`kita ${projectName} ko ${stage} environment chaina.`);
            return res.send(`kita ${projectName} lai ${stage} ma deploy garne permission talai chaina @${user.mention_name} pasa.`);
        }

        const projectPath = resolve(__dirname, "../project", `./${projectName}`);
        const deployProvider = project.getProvider();

        if (deployProvider.isConfigured(projectPath)) {
            res.reply(`is deploying ${projectName}/${branch} to ${stage} (compare: ${project.getCompareUrl(branch)})`);

            deployProvider.deploy(projectPath, branch, stage, user)
                .on('error', line => {
                    res.send(line);
                })
                .on('finish', () => {
                    res.send(`@${user.mention_name}'s ${stage} deployment of ${projectName}/${branch} is done!`);
                });

            return;
        }

        res.reply(`pasa pahile ${projectName} ko lagi configurations setup gar, ani balla deploy haan.`);
    } catch (e) {
        robot.logger.error(e);
        res.send(config.get('hakuLines.projectPayena', {project: projectName, username: user.mention_name}));
    }
};

/**
 * Haku give you the version of the project reading the ver.txt from the
 * given environment. Environment falls back to staging if nothing is provided.
 * @param res
 * @param robot
 */
export const version = (res, robot) => {
    const user = getUser(res);
    const parts = escape(res.match[2]).split(' ');
    const projectName = escape(parts[0]);
    const stage = escape(parts[1]) || 'staging';

    try {
        const project = projectCollection.findByName(projectName);
        const responseHandler = (error, response, body) => {
            if (error) {
                res.reply(config.get('hakuLines.bal') + ' , ' + error);

                return;
            }

            if (200 != response.statusCode) {
                res.reply(config.get('hakuLines.dheraiDin') + ', url ta payena.');

                return;
            }

            res.send(`version chai taniyo @${user.mention_name} pasa ${projectName} ko ${stage} bata : ${'\n'} ${body}`);
        };

        project.requestDeployedVersion(stage, responseHandler);
    } catch (error) {
        robot.logger.error(error);
        res.send(config.get('hakuLines.projectOrEnvPayena', {username: user.mention_name}));
    }
};
