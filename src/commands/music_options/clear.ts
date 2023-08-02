import {ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import Command from "../../discord_utils/command";

export const cmd = new Command()
  .setName("clear")
  .setDescription("Clear queue")
  .setExec(async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({content: channel.error.message, ephemeral: true});
    }

    const queue = interaction.client.songQueue;
    queue.clear();
    return interaction.followUp({content: `Cleared queue ${Emoji.trash}`});
  });
