import config from "./config";

export default robot => {
    robot.error((err, res) => {
        robot.logger.error(err);

        if (res) {
            res.reply(`${config.get('hakuLines.dheraiDin')}, ${err}`);
        }
    });
};
