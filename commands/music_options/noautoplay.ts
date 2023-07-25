import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("noautoplay")
    .setDescription("Disable autoplay of songs on queue end"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      soundCommandGuard(interaction);
    } catch (err: any) {
      return interaction.followUp({ content: err.message, ephemeral: true });
    }

    // @ts-ignore -- songQueue is a valid property
    const queue = interaction.client.songQueue;
    queue.noautoplay();
    return interaction.followUp({content: `Autoplay disabled ${Emoji.infinity}${Emoji.cross}`});
  },
};
