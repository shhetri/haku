import {projectCollection} from "../project";
import config from "../../config";
import {escape, getUser, getRoom} from "../../helpers";

/**
 * List all the projects that are configured in haku for deployment
 * @param res
 */
export const listsProjects = res => {
    const projects = projectCollection.all();

    if (projects.length) {
        return res.send(`${config.get('hakuLines.herumProjectList')} : ${'\n *'} ${projects.map(project => project.name).join('\n * ')}`);
    }

    res.send(`${config.get('hakuLines.herumProjectList')} : ${config.get('hakuLines.projectsChaina')}`);
};

/**
 * List all the projects that can be deployed from a particular room
 * @param res
 */
export const listsProjectsInRoom = res => {
    const projects = projectCollection.getInRoom(getRoom(res));

    if (projects.length) {
        return res.send(`${config.get('hakuLines.herumRoomKoProjectList')} : ${'\n *'} ${projects.map(project => project.name).join('\n * ')}`);
    }

    res.send(`${config.get('hakuLines.herumRoomKoProjectList')} : ${config.get('hakuLines.projectsChaina')}`);
};

/**
 * List some examples of how to deploy a project
 * @param res
 */
export const deployHelp = res => {
    res.send(config.get('hakuLines.deployTarika'));
    res.send('deploy blog to staging');
    res.send('deploy blog BL-20 to production (note: BL-20 is the branch name)');
    res.send('deploy blog BL-20 to staging (note: BL-20 is the branch name)');
    res.send('deploy blog (note: branch defaults to master and stage defaults to staging)');
    res.send('deploy blog -v (note: -v for verbose)');
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
    const verbose = (res.match[4] || '').trim() === '-v';

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

        const deployProvider = project.getProvider();
        const onStart = () => res.reply(`is deploying ${projectName}/${branch} to ${stage} (compare: ${project.getCompareUrl(branch)})`);
        const onRunning = line => res.send(line);
        const onSuccess = () => res.send(`@${user.mention_name}'s ${stage} deployment of ${projectName}/${branch} is done!`);
        const onError = line => res.send(line);

        deployProvider.deploy(project, branch, stage, user)(onStart, onSuccess, onError, verbose && onRunning);
    } catch (e) {
        robot.logger.error(e);
        res.reply(e);
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
