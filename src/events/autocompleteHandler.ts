import {AutocompleteInteraction, Events} from "discord.js";
import ensureError from "../utils/error";
import {logger} from "../utils/logger";

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: AutocompleteInteraction) {
    if (!interaction.isAutocomplete()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      logger.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (errUnknown) {
      const error = ensureError(errUnknown);
      logger.error(`Error autocompleting for command ${interaction.commandName}: [error=${error.message}]`);
    }
  },
};
