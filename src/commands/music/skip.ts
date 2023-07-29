import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip song"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction);
    if (channel.isErr()) {
      return interaction.followUp({ content: channel.error.message, ephemeral: true });
    }

    const queue = interaction.client.songQueue;
    if (queue.getCurrentSong().isOk()) {
      await queue.skip();
      return interaction.followUp({ content: `Skipped ${Emoji.fast_forward}` });
    } else {
      return interaction.followUp({ content: `Queue ended ${Emoji.stop_button}` });
    }
  },
};
