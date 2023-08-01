import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffles the queue"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({ content: channel.error.message, ephemeral: true });
    }

    const queue = interaction.client.songQueue;
    queue.shuffle();
    return interaction.followUp({ content: `Shuffled the queue ${Emoji.twisted_arrows}` });
  },
};
