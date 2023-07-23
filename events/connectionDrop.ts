import {ChatInputCommandInteraction} from "discord.js";
import {VoiceConnectionStatus, entersState, getVoiceConnection} from "@discordjs/voice";

module.exports = {
  name: VoiceConnectionStatus.Disconnected,
  async execute(interaction: ChatInputCommandInteraction) {
    const connection = getVoiceConnection(interaction.guildId!)!;

    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
      // Seems to be reconnecting to a new channel - ignore disconnect
    } catch (error) {
      // Seems to be a real disconnect which SHOULDN'T be recovered from
      connection.destroy();
    }
  },
};
