import { EmbedBuilder } from 'discord.js';
import { Queue } from '../queue/queue';
import { Emoji } from '../utils/emojiCharacters';
import { Result, err, ok } from 'neverthrow';

export function currentSongEmbed(queue: Queue): Result<EmbedBuilder, Error> {
  const song = queue.getCurrentSong();
  if (song.isErr()) {
    return err(song.error);
  }

  return ok(new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(song.value.title)
    .setURL(song.value.url)
    .setDescription(`by ${song.value.author}`)
    .setThumbnail(song.value.thumbnail)
    .setFooter({
      text: `${song.value.timeStr()}/${song.value.durationStr()} ${Emoji.clock4}`
    }));
}


