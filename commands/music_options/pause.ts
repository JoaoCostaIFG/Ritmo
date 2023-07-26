import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      soundCommandGuard(interaction);
    } catch (err: any) {
      return interaction.followUp({ content: err.message, ephemeral: true });
    }

    // @ts-ignore -- songQueue is a valid property
    const queue: Queue = interaction.client.songQueue;
    queue.pause();
    return interaction.followUp({ content: `Paused ${Emoji.pause_button}` });
  },
};
