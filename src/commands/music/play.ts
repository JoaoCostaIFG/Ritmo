import {AutocompleteInteraction, ChatInputCommandInteraction} from "discord.js";
import {soundCommandGuard} from "../../utils/soundCommandGuard";
import {Emoji} from "../../utils/emojiCharacters";
import {addSongEmbed} from "../../embeds/addSongEmbed";
import getYtAutocomplete from "../../utils/ytAutocomplete";
import Command from "../../discord_utils/command";


export const cmd = new Command()
  .setName("play")
  .addAlias("p")
  .setDescription("Plays song")
  .addStringOption(option => option
    .setName("song")
    .setDescription("The song to play")
    .setAutocomplete(true)
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

    const songName = interaction.options.getString("song");
    if (!songName) {
      return interaction.followUp({
        content: "You're missing the song argument.",
        ephemeral: true,
      });
    }

    const queue = interaction.client.songQueue;

    return await queue.join(channel.value)
      .andThen(() => queue.play(songName))
      .match(
        (song) => interaction.followUp({
          content: `Added ${song.title} ${Emoji.music}`,
          embeds: [addSongEmbed(song)],
        }),
        (error) => interaction.followUp({
          content: `${error.message} ${Emoji.cross}`,
          ephemeral: true,
        })
      );
  })
  .setAutocomplete(async (interaction: AutocompleteInteraction) => {
    const focusedValue = interaction.options.getFocused();
    getYtAutocomplete(focusedValue).then(choices => {
      if (choices.isOk()) {
        interaction.respond(choices.value.map(choice => ({name: choice, value: choice})));
      } else {
        interaction.respond([]);
      }
    })
  });
