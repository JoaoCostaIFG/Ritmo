import {ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import {queueEmbed} from "../../embeds/queueEmbed";
import Command from "../../discord_utils/command";

export const cmd = new Command()
  .setName("queue")
  .addAlias("q")
  .setDescription("Lists the queue contents")
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
      content: `The queue ${Emoji.paperstack}`,
      embeds: [queueEmbed(queue)],
    });
  });
