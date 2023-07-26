import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";
import { Queue } from "../../queue/queue";
import { currentSongEmbed } from "../../embeds/currentSongEmbed";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("np")
    .setDescription("Now playing"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      soundCommandGuard(interaction);
    } catch (err: any) {
      return interaction.followUp({ content: err.message, ephemeral: true });
    }

    // @ts-ignore -- songQueue is a valid property
    const queue: Queue = interaction.client.songQueue;
    try {
      if (!queue.hasSong()) {
        return interaction.followUp({ content: `Queue ended ${Emoji.stop_button}` });
      }
      const song = queue.getCurrentSong();
      await interaction.followUp({ content: `Playing ${song.title} ${Emoji.notes}` });
      return interaction.channel?.send({ embeds: [currentSongEmbed(queue)] });
    } catch (err: any) {
      console.error(`Failure on nowplaying: [error=${err}]`);
      return interaction.followUp({
        content: "Failed to find the current song.",
        ephemeral: true,
      });
    }
  },
};
