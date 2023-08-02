import {ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import Command from "../../discord_utils/command";

export const cmd = new Command()
  .setName("move")
  .setDescription("Move songs in the queue")
  .addNumberOption(option => option
    .setName("from")
    .setDescription("The index of the song to move")
    .setRequired(true),
  )
  .addNumberOption(option => option
    .setName("to")
    .setDescription("The index to move to"),
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
    const to = interaction.options.getNumber("to", false) ?? undefined;

    const queue = interaction.client.songQueue;
    return queue.move(from, to)
      .match(
        (toIdx) => interaction.followUp({
          content: `Moved song from ${from} to ${toIdx} ${Emoji.left_right_arrow}`,
        }),
        (error) => interaction.followUp({
          content: `${error.message} ${Emoji.cross}`,
          ephemeral: true,
        })
      );
  })

