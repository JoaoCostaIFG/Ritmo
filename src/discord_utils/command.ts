import { ChatInputCommandInteraction, InteractionResponse, Message, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from "discord.js";
import ensureError from "../utils/error";
import { ResultAsync } from "neverthrow";

export default class Command extends SlashCommandBuilder {
    private aliasList: string[];
    private execFunc: (interaction: ChatInputCommandInteraction) => Promise<InteractionResponse>;

    constructor() {
        super();
        this.aliasList = [];
        this.execFunc = async (interaction: ChatInputCommandInteraction) => {
            return interaction.reply("This command is not implemented yet.");
        };
    }

    addAlias(alias: string): this {
        this.aliasList.push(alias);
        return this;
    }

    public get aliases(): string[] {
        return this.aliasList;
    }

    public toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        const ret = super.toJSON();
        // @ts-ignore
        delete ret.aliasList;
        return ret;
    }

    public toJSONWithAliases(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
        const origName = this.name;
        const ret: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [
            this.toJSON(),
            ...this.aliasList.map((alias) => {
                this.setName(alias);
                return this.toJSON();
            })
        ];
        this.setName(origName);
        return ret;
    }

    public static deleteGuild(token: string, clientId: string, guildId: string): ResultAsync<void, Error> {
        const rest = new REST().setToken(token);
        return ResultAsync.fromPromise(
            rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] }),
            (e) => ensureError(e)
        )
            .map((_ignore) => undefined);
    }

    public static deleteGlobal(token: string, clientId: string): ResultAsync<void, Error> {
        const rest = new REST().setToken(token);
        return ResultAsync.fromPromise(
            rest.put(Routes.applicationCommands(clientId), { body: [] }),
            (e) => ensureError(e)
        )
            .map((_ignore) => undefined);
    }

    public static deployGuild(token: string, clientId: string, guildId: string, commands: Command[]): ResultAsync<number, Error> {
        const rest = new REST().setToken(token);
        const req = commands.map((c) => c.toJSONWithAliases()).flat(2);
        return ResultAsync.fromPromise(
            rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: req }),
            (e) => ensureError(e)
        )
            .map((_ignore) => req.length);
    }

    public static deployGlobal(token: string, clientId: string, commands: Command[]): ResultAsync<number, Error> {
        const rest = new REST().setToken(token);
        const req = commands.map((c) => c.toJSONWithAliases()).flat(2);
        return ResultAsync.fromPromise(
            rest.put(Routes.applicationCommands(clientId), { body: req }),
            (e) => ensureError(e)
        )
            .map((_ignore) => req.length);
    }
}
