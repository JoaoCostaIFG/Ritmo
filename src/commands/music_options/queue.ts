import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";
import { queueEmbed } from "../../embeds/queueEmbed";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Lists the queue contents"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({
        content: channel.error.message, ephemeral: true
      });
    }

    const queue = interaction.client.songQueue;
    return interaction.followUp({
      content: `The queue ${Emoji.paperstack}`,
      embeds: [queueEmbed(queue)],
    });
  },
};
