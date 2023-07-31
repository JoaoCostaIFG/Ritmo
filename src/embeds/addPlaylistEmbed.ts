import { EmbedBuilder } from 'discord.js';
import Playlist from '../queue/playlist';

export function addPlaylistEmbed(playlist: Playlist): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(playlist.title)
    .setURL(playlist.url)
    .setDescription(`by ${playlist.author}`)
    .setThumbnail(playlist.thumbnail);
}
