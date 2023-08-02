import 'dotenv/config'
import path from 'path';
import Command from './discord_utils/command';
import {loadCommands} from './discord_utils/loader';
import {logger} from './utils/logger';

async function main() {
  const cmdsRes = loadCommands(path.join(__dirname, "commands"));
  if (cmdsRes.isErr()) {
    logger.error(cmdsRes.error);
    return;
  }
  const commands = Array.from(cmdsRes.value.values());

  logger.info(`Started refreshing ${commands.length} application (/) commands.`);

  const delRes = await Command.deleteGlobal(process.env.TOKEN ?? "", process.env.CLIENTID ?? "");
  if (delRes.isErr()) {
    logger.error(`Failed to delete global commands: ${delRes.error}`);
    return;
  }
  logger.info("Successfully deleted all global commands.");

  const deployRes = await Command.deployGlobal(process.env.TOKEN ?? "", process.env.CLIENTID ?? "", commands);
  if (deployRes.isErr()) {
    logger.error(`Failed to deploy global commands: ${deployRes.error}`);
    return;
  }
  logger.info(`Successfully reloaded ${deployRes.value} global application (/) commands.`);
}

main();

