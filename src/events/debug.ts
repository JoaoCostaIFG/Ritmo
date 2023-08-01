import {Events, Message} from "discord.js";
import {logger} from "../utils/logger";

module.exports = {
  name: Events.Debug,
  once: false,
  execute(m: Message) {
    logger.debug(m);
  },
};
