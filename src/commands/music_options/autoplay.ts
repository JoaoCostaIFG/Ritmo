import {ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import {Queue} from "../../queue/queue";
import Command from "../../discord_utils/command";

export const cmd = new Command()
  .setName("autoplay")
  .setDescription("Enable autoplay of songs on queue end")
  .setExec(async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({content: channel.error.message, ephemeral: true});
    }

    const queue: Queue = interaction.client.songQueue;
    queue.autoplay();
    return interaction.followUp({content: `Autoplay enabled ${Emoji.infinity}`});
  })
