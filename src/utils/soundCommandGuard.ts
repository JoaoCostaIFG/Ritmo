import { ChatInputCommandInteraction, VoiceBasedChannel } from "discord.js";
import { Result, err, ok } from "neverthrow";

function user2VoiceChannel(interaction: ChatInputCommandInteraction, userId: string): VoiceBasedChannel | null {
  const channel = interaction.guild!.members.cache.get(userId)!.voice.channel;
  return channel;
}

export function soundCommandGuard(interaction: ChatInputCommandInteraction): Result<VoiceBasedChannel, Error> {
  const channel = user2VoiceChannel(interaction, interaction.member!.user.id!);
  if (!channel) {
    return err(Error("You must be in a voice channel to use this command."));
  }

  const botChannel = user2VoiceChannel(interaction, interaction.client.user.id);
  if (botChannel && botChannel.id !== channel.id) {
    return err(Error("You must be on the same channel as the bot to issue sound commands."));
  }

  return ok(channel);
}
