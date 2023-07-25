import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip song"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      soundCommandGuard(interaction);
    } catch (err: any) {
      return interaction.followUp({ content: err.message, ephemeral: true });
    }

    // @ts-ignore -- songQueue is a valid property
    const queue = interaction.client.songQueue;
    try {
      await queue.skip();

      const song = queue.currentSong;
      if (song) {
        return interaction.followUp({ content: `Added ${song.title} ${Emoji.notes}` });
      } else {
        return interaction.followUp({ content: `Queue ended ${Emoji.stop_button}` });
      }
    } catch (err: any) {
      console.error(`Failure while skipping song: [error=${err}]`);
      return interaction.followUp({
        content: "Failed to skip song.",
        ephemeral: true,
      });
    }
  },
};
