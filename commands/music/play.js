const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays song")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The song to play")
        .setRequired(true),
    ),
  async execute(interaction, input) {
    const guildMember = interaction.member;
    const channel = guildMember.voice.channel;

    if (!channel) {
      return interaction
        .reply({
          content: "You must be in a voice channel to use this command.",
          ephemeral: true,
        })
        .catch(console.error);
    }

    const songName = interaction.options.getString("song") || input;
    if (!songName) {
      return interaction
        .reply({
          content: "You're missing the song argument.",
          ephemeral: true,
        })
        .catch(console.error);
    }

    await interaction.deferReply();

    const queue = interaction.client.songQueue;
    try {
      await queue.add(songName);
      await queue.process();
      await queue.join(channel);
    } catch (reject) {
      console.error(reject);
      return interaction.followUp({
        content: "Failed to play song.",
        ephemeral: true,
      });
    }

    await interaction.followUp({
      content: `Playing ${queue.currentSong.author} — ${queue.currentSong.title}`,
    });
  },
};
