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

  const commands = cmdsRes.value;
  commands.forEach((cmd: Command) => {
    logger.info(`Command: ${cmd.name}/${cmd.aliases}`);
  });
}

main();
