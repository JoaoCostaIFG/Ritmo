import {ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import Command from "../../discord_utils/command";

export const cmd = new Command()
  .setName("disconnect")
  .addAlias("dc")
  .setDescription("Stop playing and disconnect from the voice channel")
  .setExec(async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({
        content: `${channel.error.message} ${Emoji.cross}`,
        ephemeral: true
      });
    }

    const queue = interaction.client.songQueue;
    queue.stop();
    const disconnectRes = queue.disconnect(channel.value);
    if (disconnectRes.isErr()) {
      return interaction.followUp({
        content: `${disconnectRes.error.message} ${Emoji.cross}`,
        ephemeral: true
      });
    }
    return interaction.followUp({
      content: `Stopped and disconnected ${Emoji.no_entry}`
    });
  });
