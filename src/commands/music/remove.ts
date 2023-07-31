import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Move songs in the queue")
    .addNumberOption(option => option
      .setName("from")
      .setDescription("The index of the song to move")
      .setRequired(true),
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

    const queue = interaction.client.songQueue;
    return queue.remove(from)
      .map((song) => interaction.followUp({
        content: `Removed '${song.title}' from queue ${Emoji.trash}`,
      }))
      .mapErr((error) => interaction.followUp({
        content: `${error.message} ${Emoji.cross}`,
        ephemeral: true,
      }));
  },
};
