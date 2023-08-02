import {AutocompleteInteraction, Events} from "discord.js";
import Command from "../discord_utils/command";
import ensureError from "../utils/error";
import {logger} from "../utils/logger";

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: AutocompleteInteraction) {
    if (!interaction.isAutocomplete()) return;

    const command: Command | undefined = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (e) {
      const error = ensureError(e);
      logger.error(`Error autocompleting for command ${interaction.commandName}: [error=${error.message}]`);
    }
  },
};
