require("dotenv").config();

const path = require("node:path");

const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { generateDependencyReport } = require("@discordjs/voice");

const { Queue } = require("./queue/queue.js");
const { logger } = require("./utils/logger.js");
const { default: Command } = require("./discord_utils/command.js");
const { loadCommands } = require("./discord_utils/loader.js");

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
  client.commands = loadCommands(path.join(__dirname, "commands"));
  await registerEvents(client, path.join(__dirname, "events"));
  client.songQueue = new Queue({});

  client.login(process.env.TOKEN);
}
