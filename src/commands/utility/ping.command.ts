import { Message, SlashCommandBuilder } from "discord.js";

import { RegisterBehavior } from "@sapphire/framework";

import { DuduCommand } from "@~/lib/extensions/command.extension";

export class PingCommand extends DuduCommand {
    constructor(context: DuduCommand.Context, options: DuduCommand.Options) {
        super(context, {
            ...options,
            name: "ping",
            description: "Get the bot's ping.",
        });
    }

    override registerApplicationCommands(registry: DuduCommand.Registry) {
        const command: SlashCommandBuilder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);

        registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    async chatInputRun(interaction: DuduCommand.ChatInputCommandInteraction) {
        return interaction.reply("Pong!");
    }

    async messageRun(message: Message) {
        return message.reply("Pong!");
    }
}
