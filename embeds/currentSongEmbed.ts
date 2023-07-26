import { EmbedBuilder } from 'discord.js';
import { Queue } from '../queue/queue';
import { Emoji } from '../utils/emojiCharacters';

export function currentSongEmbed(queue: Queue) {
  const song = queue.getCurrentSong();

  return new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(song.title)
    .setURL(song.url)
    .setDescription(`by ${song.author}`)
    .setThumbnail(song.thumbnail)
    .setFooter({
      text: `${song.timeStr()}/${song.durationStr()} ${Emoji.clock4}`
    });
}


