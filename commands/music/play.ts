import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {soundCommandGuard, user2VoiceChannel} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";

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

    const channel = user2VoiceChannel(interaction, interaction.member!.user.id!);
    const err = soundCommandGuard(interaction, channel);
    if (err) {
      return err;
    }

    const songName = interaction.options.getString("song") || input;
    if (!songName) {
      return interaction
        .followUp({
          content: "You're missing the song argument.",
          ephemeral: true,
        })
        .catch(console.error);
    }


    // @ts-ignore -- songQueue is a valid property
    const queue = interaction.client.songQueue;
    try {
      const song = await queue.add(songName);
      await queue.process();
      await queue.join(channel);

      return interaction.followUp({content: `Added ${song.title} ${Emoji.notes}`});
    } catch (reject) {
      console.error(reject);
      return interaction.followUp({
        content: "Failed to play song.",
        ephemeral: true,
      });
    }
  },
};
