import {Events, Message} from "discord.js";
import {logger} from "../utils/logger";

module.exports = {
  name: Events.Warn,
  once: false,
  execute(m: Message) {
    logger.warn(m);
  },
};
