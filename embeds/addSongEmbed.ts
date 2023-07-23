import {EmbedBuilder} from 'discord.js';
import Song from '../queue/song';

export function addSongEmbed(song: Song) {
  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(song.title)
    .setURL(song.url)
    .setDescription(`by ${song.author}`)
    .setThumbnail(song.thumbnail);

  return embed;
}


