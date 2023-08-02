import {generateDependencyReport} from '@discordjs/voice';
import {Client, GatewayIntentBits} from 'discord.js';
import 'dotenv/config'
import path from 'path';
import {loadCommands, registerEvents} from './discord_utils/loader';
import {Queue} from './queue/queue';
import {logger} from './utils/logger';

async function main() {
  logger.info(generateDependencyReport());

  // Create a new client instance
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
    ],
  });
  const cmdsRes = loadCommands(path.join(__dirname, "commands"));
  if (cmdsRes.isErr()) {
    logger.error(cmdsRes.error);
    return;
  }
  client.commands = cmdsRes.value;
  await registerEvents(client, path.join(__dirname, "events"));
  client.songQueue = new Queue({});

  client.login(process.env.TOKEN);
}

main();
