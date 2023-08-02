import {Events, ChatInputCommandInteraction} from "discord.js";
import Command from "../discord_utils/command";
import ensureError from "../utils/error";
import {logger} from "../utils/logger";

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const command: Command | undefined = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (e) {
      const error = ensureError(e);
      logger.error(`Error executing ${interaction.commandName} : [error=${error.message}]`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  },
};
