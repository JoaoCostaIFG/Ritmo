import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";
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

    const queue = interaction.client.songQueue;
    return queue.getCurrentSong()
      .asyncMap(
        (song) => interaction.followUp({
          content: `Playing ${song.title} ${Emoji.notes}`,
          embeds: [currentSongEmbed(song)]
        })
      )
      .mapErr(
        (_err) => interaction.followUp({
          content: `No song is playing ${Emoji.stop_button}`
        }),
      )
  },
};
