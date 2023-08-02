import {ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import Command from "../../discord_utils/command";

export const cmd = new Command()
  .setName("noautoplay")
  .setDescription("Disable autoplay of songs on queue end")
  .setExec(async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({content: channel.error.message, ephemeral: true});
    }

    const queue = interaction.client.songQueue;
    queue.noAutoplay();
    return interaction.followUp({content: `Autoplay disabled ${Emoji.infinity}${Emoji.cross}`});
  });
