import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";
import { addSongEmbed } from "../../embeds/addSongEmbed";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays song")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The song to play")
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

    const songName = interaction.options.getString("song") || input;
    if (!songName) {
      return interaction.followUp({
        content: "You're missing the song argument.",
        ephemeral: true,
      });
    }

    const queue = interaction.client.songQueue;
    const joinRes = await queue.join(channel.value);
    if (joinRes.isErr()) {
      return interaction
        .followUp({
          content: `${joinRes.error.message} ${Emoji.cross}`,
          ephemeral: true,
        });
    }

    const songRes = await queue.add(songName);
    if (songRes.isErr()) {
      return interaction.followUp({
        content: `${songRes.error.message} ${Emoji.cross}`,
        ephemeral: true,
      });
    }
    return interaction.followUp({
      content: `Added ${songRes.value.title} ${Emoji.notes}`,
      embeds: [addSongEmbed(songRes.value)],
    });
  },
};
