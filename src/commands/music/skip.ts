import {ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import Command from "../../discord_utils/command";

export const cmd = new Command()
  .setName("skip")
  .setDescription("Skip song")
  .setExec(async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction);
    if (channel.isErr()) {
      return interaction.followUp({content: channel.error.message, ephemeral: true});
    }

    const queue = interaction.client.songQueue;
    if (queue.getCurrentSong().isOk()) {
      await queue.skip();
      return interaction.followUp({content: `Skipped ${Emoji.fast_forward}`});
    } else {
      return interaction.followUp({content: `Queue ended ${Emoji.stop_button}`});
    }
  })
