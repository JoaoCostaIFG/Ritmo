import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear queue"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({ content: channel.error.message, ephemeral: true });
    }

    // @ts-ignore -- songQueue is a valid property
    const queue: Queue = interaction.client.songQueue;
    queue.stop();
    return interaction.followUp({ content: `Cleared queue ${Emoji.trash}` });
  },
};
