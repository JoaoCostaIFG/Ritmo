import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("Move songs in the queue")
    .addNumberOption(option => option
      .setName("from")
      .setDescription("The index of the song to move")
      .setRequired(true),
    )
    .addNumberOption(option => option
      .setName("to")
      .setDescription("The index to move to"),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({
        content: `${channel.error.message} ${Emoji.cross}`,
        ephemeral: true
      });
    }

    const from = interaction.options.getNumber("from", true);
    const to = interaction.options.getNumber("to", false) ?? undefined;

    const queue = interaction.client.songQueue;
    return queue.move(from, to)
      .map((toIdx) => interaction.followUp({
        content: `Moved song from ${from} to ${toIdx} ${Emoji.left_right_arrow}`,
      }))
      .mapErr((error) => interaction.followUp({
        content: `${error.message} ${Emoji.cross}`,
        ephemeral: true,
      }));
  },
};
