import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";
import { addSongEmbed } from "../../embeds/addSongEmbed";
import { Queue } from "../../queue/queue";

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

    let channel;
    try {
      channel = soundCommandGuard(interaction);
    } catch (err: any) {
      return interaction.followUp({ content: err.message, ephemeral: true });
    }

    const songName = interaction.options.getString("song") || input;
    if (!songName) {
      return interaction
        .followUp({
          content: "You're missing the song argument.",
          ephemeral: true,
        });
    }

    // @ts-ignore -- songQueue is a valid property
    const queue: Queue = interaction.client.songQueue;
    try {
      await queue.join(channel);
      const song = await queue.add(songName);

      await interaction.followUp({ content: `Added ${song.title} ${Emoji.notes}` });
      return interaction.channel?.send({ embeds: [addSongEmbed(song)] });
    } catch (error) {
      console.error(`Failure while adding song: [error=${error}]`);
      return interaction.followUp({
        content: "Failed to play song.",
        ephemeral: true,
      });
    }
  },
};
