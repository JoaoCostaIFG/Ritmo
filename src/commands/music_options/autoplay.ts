import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";
import { Queue } from "../../queue/queue";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autoplay")
    .setDescription("Enable autoplay of songs on queue end"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({ content: channel.error.message, ephemeral: true });
    }

    const queue: Queue = interaction.client.songQueue;
    queue.autoplay();
    return interaction.followUp({ content: `Autoplay enabled ${Emoji.infinity}` });
  },
};
