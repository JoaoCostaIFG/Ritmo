import {ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import {currentSongEmbed} from "../../embeds/currentSongEmbed";
import Command from "../../discord_utils/command";


export const cmd = new Command()
  .setName("nowplaying")
  .addAlias("np")
  .setDescription("Now playing")
  .setExec(async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({content: channel.error.message, ephemeral: true});
    }

    const queue = interaction.client.songQueue;
    return queue.getCurrentSong()
      .match(
        (song) => interaction.followUp({
          content: `Playing ${song.title} ${Emoji.notes}`,
          embeds: [currentSongEmbed(song)]
        }),
        (_err) => interaction.followUp({
          content: `No song is playing ${Emoji.stop_button}`
        })
      );
  });
