import { AutocompleteInteraction, Events } from "discord.js";
import ensureError from "../utils/error";

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: AutocompleteInteraction) {
    if (!interaction.isAutocomplete()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (errUnknown) {
      const error = ensureError(errUnknown);
      console.error(`Error autocompleting for command ${interaction.commandName}: [error=${error.message}]`);
    }
  },
};
