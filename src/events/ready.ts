import {Events, Client} from "discord.js";
import {logger} from "../utils/logger";

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    logger.info(`Ready! Logged in as ${client.user!.tag}`);
  },
};
