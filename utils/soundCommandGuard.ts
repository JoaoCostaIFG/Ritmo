import {ChatInputCommandInteraction, VoiceBasedChannel} from "discord.js";

export function user2VoiceChannel(interaction: ChatInputCommandInteraction, userId: string) {
  const channel = interaction.guild!.members.cache.get(userId)!.voice.channel;
  return channel;
}

export function soundCommandGuard(interaction: ChatInputCommandInteraction, channel: VoiceBasedChannel | null) {
  if (!channel) {
    return interaction
      .followUp({
        content: "You must be in a voice channel to use this command.",
        ephemeral: true,
      })
      .catch(console.error);
  }

  const botChannel = user2VoiceChannel(interaction, interaction.client.user.id);
  if (botChannel && botChannel.id !== channel.id) {
    return interaction
      .followUp({
        content: "You must be on the same channel as the bot to issue sound commands.",
        ephemeral: true,
      })
      .catch(console.error);
  }

  return null;
}
