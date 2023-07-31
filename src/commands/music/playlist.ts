import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";
import { addPlaylistEmbed } from "../../embeds/addPlaylistEmbed";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Plays a playlist")
    .addStringOption(option => option
      .setName("url")
      .setDescription("The playlist to play")
      .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction, input: string) {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({
        content: `${channel.error.message} ${Emoji.cross}`,
        ephemeral: true
      });
    }

    const url = interaction.options.getString("url") || input;
    if (!url) {
      return interaction.followUp({
        content: "You're missing the url argument.",
        ephemeral: true,
      });
    }

    const queue = interaction.client.songQueue;

    return await queue.join(channel.value)
      .andThen(() => queue.playList(url))
      .map((playlist) => interaction.followUp({
        content: `Added ${playlist.songs.length} songs from '${playlist.title}' playlist ${Emoji.notes}`,
        embeds: [addPlaylistEmbed(playlist)],
      }))
      .mapErr((error) => interaction.followUp({
        content: `${error.message} ${Emoji.cross}`,
        ephemeral: true,
      }));
  },
};
