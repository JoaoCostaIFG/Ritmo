import {ChatInputCommandInteraction} from "discord.js";
import Command from "../../discord_utils/command";

export const cmd = new Command()
	.setName("ping")
	.setDescription('Replies with Pong!')
	.setExec(async (interaction: ChatInputCommandInteraction) => {
		return interaction.reply('Pong!');
	});
