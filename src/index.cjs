require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");

const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { generateDependencyReport } = require("@discordjs/voice");

const { Queue } = require("./queue/queue.js");
const {logger} = require("./utils/logger.js");

function collectCommands() {
  let commands = new Collection();

  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      command.category = folder; // set category for reload command

      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("data" in command && "execute" in command) {
        commands.set(command.data.name, command);
      } else {
        logger.warn(
          `The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }

  return commands;
}

async function registerEvents(client) {
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = await import(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

logger.info(generateDependencyReport());

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});
client.commands = collectCommands();
registerEvents(client);
client.songQueue = new Queue({});

client.login(process.env.TOKEN);
