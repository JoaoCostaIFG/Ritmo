import { EmbedBuilder } from 'discord.js';
import { Queue } from '../queue/queue';

export function queueEmbed(queue: Queue): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle("Next songs in queue")
    .setDescription(`total of ${queue.size} songs`)
    .addFields(queue.queue.slice(0, 10).map((song, index) => {
      return { name: `${index + 1}. ${song.title}`, value: `by ${song.author}` }
    }));

  return embed;
}


