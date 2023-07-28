import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
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

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({ content: channel.error.message, ephemeral: true });
    }

    // @ts-ignore -- songQueue is a valid property
    const queue: Queue = interaction.client.songQueue;
    return queue.getCurrentSong()
      .asyncMap(
        (song) => interaction.followUp({ content: `Playing ${song.title} ${Emoji.notes}`, embeds: [currentSongEmbed(queue).unwrapOr(new EmbedBuilder())] }))
      .mapErr(
        (_err) => interaction.followUp({ content: `No song is playing ${Emoji.stop_button}` }),
      )
  },
};
