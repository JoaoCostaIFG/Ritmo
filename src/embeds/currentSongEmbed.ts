import { EmbedBuilder } from 'discord.js';
import { Emoji } from '../utils/emojiCharacters';
import { QueueSong } from '../queue/queueSong';

export function currentSongEmbed(song: QueueSong): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(song.title)
    .setURL(song.url)
    .setDescription(`by ${song.author}`)
    .setThumbnail(song.thumbnail)
    .setFooter({
      text: `${song.timeStr()}/${song.durationStr()} (-${song.timeLeftStr()}) ${Emoji.clock4}`
    });
}


