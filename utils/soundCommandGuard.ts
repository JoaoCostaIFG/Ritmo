import { ChatInputCommandInteraction, VoiceBasedChannel } from "discord.js";

function user2VoiceChannel(interaction: ChatInputCommandInteraction, userId: string): VoiceBasedChannel | null {
  const channel = interaction.guild!.members.cache.get(userId)!.voice.channel;
  return channel;
}

export function soundCommandGuard(interaction: ChatInputCommandInteraction): VoiceBasedChannel {
  const channel = user2VoiceChannel(interaction, interaction.member!.user.id!);
  if (!channel) {
    throw new Error("You must be in a voice channel to use this command.");
  }

  const botChannel = user2VoiceChannel(interaction, interaction.client.user.id);
  if (botChannel && botChannel.id !== channel.id) {
    throw new Error("You must be on the same channel as the bot to issue sound commands.");
  }

  return channel;
}
