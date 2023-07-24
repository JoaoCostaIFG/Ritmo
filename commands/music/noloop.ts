import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {soundCommandGuard, user2VoiceChannel} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("noloop")
    .setDescription("Disable loop of songs"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const channel = user2VoiceChannel(interaction, interaction.member!.user.id!);
    const err = soundCommandGuard(interaction, channel);
    if (err) {
      return err;
    }

    // @ts-ignore -- songQueue is a valid property
    const queue = interaction.client.songQueue;
    queue.noloop();
    return interaction.followUp({content: `Loop disabled ${Emoji.repeat}${Emoji.cross}`});
  },
};