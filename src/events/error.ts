import {Events, Message} from "discord.js";
import {logger} from "../utils/logger";

module.exports = {
  name: Events.Error,
  once: false,
  execute(m: Message) {
    logger.error(m);
  },
};
