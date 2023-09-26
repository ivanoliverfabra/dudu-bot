import { ChatInputCommand } from "@sapphire/framework";
import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";

export abstract class DuduCommand extends Subcommand {
    protected constructor(context: Subcommand.Context, options: SubcommandOptions) {
        super(context, {
            ...options,
        });
    }

    // @ts-ignore: Promise<unknown> instead of Promise<void>
    public async chatInputRun(
        interaction: ChatInputCommand.Interaction,
        context: ChatInputCommand.RunContext
    ): Promise<unknown> {
        return super.chatInputRun(interaction, context);
    }

    // @ts-ignore: Promise<unknown> instead of Promise<void>
    public async messageRun(message: Message, args: Args, context: MessageCommand.RunContext): Promise<unknown> {
        return super.messageRun(message, args, context);
    }
}

export declare namespace DuduCommand {
    type Options = SubcommandOptions;
    type JSON = Subcommand.JSON;
    type Context = Subcommand.Context;
    type RunInTypes = Subcommand.RunInTypes;
    type ChatInputCommandInteraction = Subcommand.ChatInputCommandInteraction;
    type ContextMenuCommandInteraction = Subcommand.ContextMenuCommandInteraction;
    type AutocompleteInteraction = Subcommand.AutocompleteInteraction;
    type Registry = Subcommand.Registry;
}
