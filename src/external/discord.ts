import {Collection} from "discord.js";
import Command from "../discord_utils/command";
import {Queue} from "../queue/queue";

declare module "discord.js" {
    interface Client {
        songQueue: Queue;
        commands: Collection<string, Command>;
    }
}
