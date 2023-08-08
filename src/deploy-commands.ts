import * as dotenv from 'dotenv';
dotenv.config({path: process.env.RITMO_ENV ?? process.cwd() + '/.env' });

import path from 'path';
import Command from './discord_utils/command';
import {loadCommands} from './discord_utils/loader';
import {logger} from './utils/logger';

async function main() {
  const cmdsRes = loadCommands(path.join(__dirname, "commands"), false);
  if (cmdsRes.isErr()) {
    logger.error(cmdsRes.error);
    return;
  }
  const commands = Array.from(cmdsRes.value.values());

  logger.info(`Started refreshing ${commands.length} application (/) commands.`);

  const delRes = await Command.deleteGuild(process.env.TOKEN ?? "", process.env.CLIENTID ?? "", process.env.GUILDID ?? "");
  if (delRes.isErr()) {
    logger.error(`Failed to delete guild commands: ${delRes.error}`);
    return;
  }
  logger.info("Successfully deleted all guild commands.");

  const deployRes = await Command.deployGuild(process.env.TOKEN ?? "", process.env.CLIENTID ?? "",
    process.env.GUILDID ?? "", commands);
  if (deployRes.isErr()) {
    logger.error(`Failed to deploy guild commands: ${deployRes.error}`);
    return;
  }
  logger.info(`Successfully reloaded ${deployRes.value} guild application (/) commands.`);
}

main();
