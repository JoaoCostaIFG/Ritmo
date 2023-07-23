import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {soundCommandGuard, user2VoiceChannel} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";

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

    const channel = user2VoiceChannel(interaction, interaction.member!.user.id!);
    const err = soundCommandGuard(interaction, channel);
    if (err) {
      return err;
    }

    const seekPointStr = interaction.options.getString("seek-point") || input;
    if (!seekPointStr) {
      return interaction
        .followUp({
          content: "You're missing the seek-point argument.",
          ephemeral: true,
        })
        .catch(console.error);
    }

    const seekComponents = seekPointStr.split(":");
    if (seekComponents.length > 3 || seekComponents.length === 0) {
      return interaction
        .followUp({
          content: "Seek point is invalid. Try something like 120, 2:0, or 0:2:0",
          ephemeral: true,
        })
        .catch(console.error);
    }

    let seekPoint = 0;
    for (let i = 0; i < seekComponents.length; ++i) {
      seekPoint *= 60;
      seekPoint += parseInt(seekComponents[i]);
    }

    // @ts-ignore -- songQueue is a valid property
    const queue = interaction.client.songQueue;
    try {
      await queue.seek(seekPoint);

      return interaction.followUp({content: `Seeked to ${seekPoint} in ${queue.currentSong.title} ${Emoji.mag}`});
    } catch (reject) {
      console.error(reject);
      return interaction.followUp({
        content: "Failed to seek to the point in the song.",
        ephemeral: true,
      });
    }
  },
};
