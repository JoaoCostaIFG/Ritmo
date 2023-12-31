import {EmbedBuilder} from 'discord.js';
import {Queue} from '../queue/queue';

export function historyEmbed(queue: Queue, page: number = 0): EmbedBuilder {
  const hist = Array.from(queue.hist).reverse();
  let pageStart = Math.min(hist.length - 10, page * 10);
  if (pageStart < 0) pageStart = 0;
  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle("Songs in history")
    .setDescription(`total of ${queue.histSize} songs`)
    .addFields(hist.slice(pageStart, pageStart + 10).map((song, index) => {
      return {name: `${pageStart + 10 - index}. ${song.title}`, value: `by ${song.author}`}
    }));

  return embed;
}
