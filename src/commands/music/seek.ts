import { ChatInputCommandInteraction } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";
import { timeStr2Secs } from "../../utils/time";
import Command from "../../discord_utils/command";

export const cmd = new Command()
  .setName("seek")
  .setDescription("Seeks to a point in a song")
  .setExec(async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction);
    if (channel.isErr()) {
      return interaction.followUp({
        content: channel.error.message,
        ephemeral: true,
      });
    }

    const seekPointStr = interaction.options.getString("seek-point");
    if (!seekPointStr) {
      return interaction.followUp({
        content: "You're missing the seek-point argument.",
        ephemeral: true,
      });
    }
    const seekPoint = timeStr2Secs(seekPointStr);

    const queue = interaction.client.songQueue;
    return await queue
      .seek(seekPoint)
      .andThen(() => queue.getCurrentSong())
      .match(
        (song) =>
          interaction.followUp({
            content: `Seeked to ${seekPoint} in ${song.title} ${Emoji.mag}`,
          }),
        (err) =>
          interaction.followUp({ content: err.message, ephemeral: true }),
      );
  })
  .addStringOption((option) =>
    option
      .setName("seek-point")
      .setDescription("The poing to seek to")
      .setRequired(true),
  );
