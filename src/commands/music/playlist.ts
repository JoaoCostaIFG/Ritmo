import {ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import {addPlaylistEmbed} from "../../embeds/addPlaylistEmbed";
import Command from "../../discord_utils/command";

export const cmd = new Command()
  .setName("playlist")
  .addAlias("pl")
  .setDescription("Plays a playlist")
  .setExec(async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({
        content: `${channel.error.message} ${Emoji.cross}`,
        ephemeral: true
      });
    }

    const url = interaction.options.getString("url");
    if (!url) {
      return interaction.followUp({
        content: "You're missing the url argument.",
        ephemeral: true,
      });
    }

    const queue = interaction.client.songQueue;

    return await queue.join(channel.value)
      .andThen(() => queue.playlist(url))
      .match(
        (playlist) => interaction.followUp({
          content: `Added ${playlist.songs.length} songs from '${playlist.title}' playlist ${Emoji.notes}`,
          embeds: [addPlaylistEmbed(playlist)],
        }),
        (error) => interaction.followUp({
          content: `${error.message} ${Emoji.cross}`,
          ephemeral: true,
        })
      );
  })
  .addStringOption(option => option
    .setName("url")
    .setDescription("The playlist to play")
    .setRequired(true),
  )
