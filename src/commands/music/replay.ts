import {ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import {addSongEmbed} from "../../embeds/addSongEmbed";
import Command from "../../discord_utils/command";

export const cmd = new Command()
  .setName("replay")
  .setDescription("Replay the current song")
  .setExec(async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({
        content: `${channel.error.message} ${Emoji.cross}`,
        ephemeral: true
      });
    }

    const queue = interaction.client.songQueue;

    return await queue.join(channel.value)
      .andThen(() => queue.replay())
      .match(
        (song) => interaction.followUp({
          content: `Added ${song.title} ${Emoji.music}`,
          embeds: [addSongEmbed(song)],
        }),
        (error) => interaction.followUp({
          content: `${error.message} ${Emoji.cross}`,
          ephemeral: true,
        })
      );
  });
