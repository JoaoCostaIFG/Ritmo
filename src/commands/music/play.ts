import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { soundCommandGuard } from "../../utils/soundCommandGuard";
import { Emoji } from "../../utils/emojiCharacters";
import { addSongEmbed } from "../../embeds/addSongEmbed";
import { yt_validate, search } from "play-dl";
import { ResultAsync, okAsync } from "neverthrow";

function getYtAutocomplete(query: string): ResultAsync<string[], Error> {
  if (query.startsWith("https://") && yt_validate(query)) {
    // don't autocomplete URLs
    return okAsync([]);
  }

  return ResultAsync.fromPromise(
    search(query, { limit: 10, source: { youtube: "video" } }),
    () => new Error("Failed to autocomplete query"),
  )
    .map(searched =>
      searched.map(song => song.title ?? "").filter(title => title !== ""));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays song")
    .addStringOption(option => option
      .setName("song")
      .setDescription("The song to play")
      .setAutocomplete(true)
      .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction, input: string) {
    await interaction.deferReply();

    const channel = soundCommandGuard(interaction)
    if (channel.isErr()) {
      return interaction.followUp({
        content: `${channel.error.message} ${Emoji.cross}`,
        ephemeral: true
      });
    }

    const songName = interaction.options.getString("song") || input;
    if (!songName) {
      return interaction.followUp({
        content: "You're missing the song argument.",
        ephemeral: true,
      });
    }

    const queue = interaction.client.songQueue;

    return await queue.join(channel.value)
      .andThen(() => queue.play(songName))
      .map((song) => interaction.followUp({
        content: `Added ${song.title} ${Emoji.music}`,
        embeds: [addSongEmbed(song)],
      }))
      .mapErr((error) => interaction.followUp({
        content: `${error.message} ${Emoji.cross}`,
        ephemeral: true,
      }));
  },
  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const choiceRes = await getYtAutocomplete(focusedValue)
    if (choiceRes.isOk()) {
      await interaction.respond(
        choiceRes.value.map(choice => ({ name: choice, value: choice })),
      );
    }
  },
};
