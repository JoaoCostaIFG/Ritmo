import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";
import { timeStr2Secs } from "../../utils/time";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Seeks to a point in a song")
    .addStringOption((option) =>
      option
        .setName("seek-point")
        .setDescription("The poing to seek to")
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction, input: string) {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({ content: channel.error.message, ephemeral: true });
    }

    const seekPointStr = interaction.options.getString("seek-point") || input;
    if (!seekPointStr) {
      return interaction
        .followUp({
          content: "You're missing the seek-point argument.",
          ephemeral: true,
        });
    }
    const seekPoint = timeStr2Secs(seekPointStr);

    const queue = interaction.client.songQueue;
    try {
      await queue.seek(seekPoint);
      // return interaction.followUp({ content: `Seeked to ${seekPoint} in ${queue.getCurrentSong().title} ${Emoji.mag}` });
      return interaction.followUp({ content: `Seeked to ${seekPoint} in "TODO titutlo" ${Emoji.mag}` });
    } catch (error: any) {
      // console.error(`Failure while seeking to ${seekPoint} in ${queue.getCurrentSong().title}: [error=${error}]`);
      return interaction.followUp({
        content: "Failed to seek to the point in the song.",
        ephemeral: true,
      });
    }
  },
};