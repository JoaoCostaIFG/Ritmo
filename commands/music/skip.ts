import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {soundCommandGuard, user2VoiceChannel} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip song"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const channel = user2VoiceChannel(interaction, interaction.member!.user.id!);
    const err = soundCommandGuard(interaction, channel);
    if (err) {
      return err;
    }

    // @ts-ignore -- songQueue is a valid property
    const queue = interaction.client.songQueue;
    try {
      await queue.skip();

      const song = queue.currentSong;
      if (song) {
        return interaction.followUp({content: `Added ${song.title} ${Emoji.notes}`});
      } else {
        return interaction.followUp({content: `Queue ended ${Emoji.stop_button}`});
      }
    } catch (reject) {
      console.error(reject);
      return interaction.followUp({
        content: "Failed to skip song.",
        ephemeral: true,
      });
    }
  },
};
