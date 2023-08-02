import {ChatInputCommandInteraction, AutocompleteInteraction, InteractionResponse, Message, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder} from "discord.js";
import ensureError from "../utils/error";
import {ResultAsync} from "neverthrow";

export default class Command extends SlashCommandBuilder {
    private aliasList: string[];
    private categoryStr: string;
    private execFunc: (interaction: ChatInputCommandInteraction) => Promise<InteractionResponse | Message>;
    private autocompleteFunc: (interaction: AutocompleteInteraction) => Promise<void>;

    constructor() {
        super();
        this.categoryStr = "";
        this.aliasList = [];
        this.execFunc = async (interaction: ChatInputCommandInteraction) => {
            return interaction.reply("This command is not implemented yet.");
        };
        this.autocompleteFunc = async (interaction: AutocompleteInteraction) => {
            return interaction.respond([]);
        }
    }

    public addAlias(alias: string): this {
        if (!this.name || this.name.length === 0) {
            this.setName(alias);
        } else {
            this.aliasList.push(alias);
        }
        return this;
    }

    public get aliases(): string[] {
        return this.aliasList;
    }

    public setCategory(cat: string): this {
        this.categoryStr = cat;
        return this;
    }

    public get category(): string {
        return this.categoryStr;
    }

    public setExec(func: (interaction: ChatInputCommandInteraction) => Promise<InteractionResponse | Message>): this {
        this.execFunc = func;
        return this;
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<InteractionResponse | Message> {
        return this.execFunc(interaction);
    }

    public setAutocomplete(func: (interaction: AutocompleteInteraction) => Promise<void>): this {
        this.autocompleteFunc = func;
        return this;
    }

    public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        return this.autocompleteFunc(interaction);
    }

    public toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        const ret = super.toJSON();
        // @ts-ignore
        delete ret.aliasList, ret.categoryStr, ret.execFunc, ret.autocompleteFunc;
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
            rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: []}),
            (e) => ensureError(e)
        )
            .map((_ignore) => undefined);
    }

    public static deleteGlobal(token: string, clientId: string): ResultAsync<void, Error> {
        const rest = new REST().setToken(token);
        return ResultAsync.fromPromise(
            rest.put(Routes.applicationCommands(clientId), {body: []}),
            (e) => ensureError(e)
        )
            .map((_ignore) => undefined);
    }

    public static deployGuild(token: string, clientId: string, guildId: string, commands: Command[]): ResultAsync<number, Error> {
        const rest = new REST().setToken(token);
        const req = commands.map((c) => c.toJSONWithAliases()).flat(2);
        return ResultAsync.fromPromise(
            rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: req}),
            (e) => ensureError(e)
        )
            .map((_ignore) => req.length);
    }

    public static deployGlobal(token: string, clientId: string, commands: Command[]): ResultAsync<number, Error> {
        const rest = new REST().setToken(token);
        const req = commands.map((c) => c.toJSONWithAliases()).flat(2);
        return ResultAsync.fromPromise(
            rest.put(Routes.applicationCommands(clientId), {body: req}),
            (e) => ensureError(e)
        )
            .map((_ignore) => req.length);
    }
}
