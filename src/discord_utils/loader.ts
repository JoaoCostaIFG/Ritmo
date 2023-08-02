import {Client, Collection} from "discord.js";
import path from "path";
import fs from "fs";
import {logger} from "../utils/logger";
import Command from "./command";
import {err, ok, Result} from "neverthrow";

export function loadCommands(commandsBasePath: string): Result<Collection<string, Command>, Error> {
    let commands: Collection<string, Command> = new Collection();

    const commandFolders = fs.readdirSync(commandsBasePath);
    for (const folder of commandFolders) {
        const commandsPath = path.join(commandsBasePath, folder);
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter((file: string) => file.endsWith(".js"));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if (!("cmd" in command)) {
                logger.warn(`File at ${filePath} has no cmd.`);
                continue;
            }

            const cmd = command.cmd;
            cmd.setCategory(folder); // set category for reload command
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if (cmd instanceof Command) {
                commands.set(cmd.name, cmd);
            } else {
                logger.warn(`File at ${filePath} is not and instance of Command.`);
            }
        }
    }

    // validation
    
    const commandNames = Array.from(commands.map(c => [c.name, ...c.aliases]).flat(2));
    if (commandNames.length > 100) {
        return err(Error(`You have too many commands (${commandNames.length}). The max is 100`));
    }
    if ((new Set(commandNames)).size !== commandNames.length) {
        return err(Error(`Duplicate command names found: ${commandNames}`));
    }

    return ok(commands);
}

export async function registerEvents(client: Client, eventsPath: string) {
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
