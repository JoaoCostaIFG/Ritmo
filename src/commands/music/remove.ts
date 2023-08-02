import {ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import Command from "../../discord_utils/command";

export const cmd = new Command()
  .setName("remove")
  .setDescription("Move songs in the queue")
  .addNumberOption(option => option
    .setName("from")
    .setDescription("The index of the song to move")
    .setRequired(true),
  )
  .setExec(async (interaction: ChatInputCommandInteraction) => {
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
      .match(
        (song) => interaction.followUp({
          content: `Removed '${song.title}' from queue ${Emoji.trash}`,
        }),
        (error) => interaction.followUp({
          content: `${error.message} ${Emoji.cross}`,
          ephemeral: true,
        })
      );
  });
