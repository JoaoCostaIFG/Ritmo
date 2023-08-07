import {ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import Command from "../../discord_utils/command";
import {historyEmbed} from "../../embeds/historyEmbed";

export const cmd = new Command()
  .setName("history")
  .addAlias("hist")
  .setDescription("Lists the songs in the history")
  .setExec(async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({
        content: channel.error.message, ephemeral: true
      });
    }

    const queue = interaction.client.songQueue;
    return interaction.followUp({
      content: `The history ${Emoji.scroll}`,
      embeds: [historyEmbed(queue)],
    });
  });
