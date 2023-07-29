import { Collection } from "discord.js";
import { Queue } from "../queue/queue";

declare module "discord.js" {
    interface Client {
        songQueue: Queue;
        commands: Collection<string, any>;
    }
}