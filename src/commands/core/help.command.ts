import { ComponentType, Message, SlashCommandBuilder, chatInputApplicationCommandMention } from "discord.js";
import { Effect, pipe } from "effect";

import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { Command, CommandStore, RegisterBehavior } from "@sapphire/framework";

import { DuduCommand } from "@~/lib/extensions/command.extension";

export class HelpCommand extends DuduCommand {
    constructor(context: DuduCommand.Context, options: DuduCommand.Options) {
        super(context, {
            ...options,
            name: "help",
            description: "Retrive a helpful information about the bot and its available commands.",
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
        return Effect.runSync(this.buildCommands(interaction));
    }

    async messageRun(message: Message) {
        return Effect.runSync(this.buildCommands(message));
    }

    private buildCommands(ctx: Message | DuduCommand.ChatInputCommandInteraction) {
        const pagination = Effect.sync(() => new PaginatedMessage());
        const commands = Effect.sync(() => this.container.stores.get("commands"));
        const categoriesPipe = pipe(
            Effect.map(commands, (cmds: CommandStore) => {
                const categories = [...new Set(cmds.map((cmd: Command) => cmd.category))];
                categories.unshift("primary");

                return categories;
            })
        );

        const primaryPage = (_pagination: Effect.Effect<never, never, PaginatedMessage>) => {
            return Effect.runSync(
                Effect.map(_pagination, (paginate) => {
                    paginate.addPageEmbed((embed) => {
                        embed.setTitle("Hi-ya! I'm Dudu.");
                        embed.setDescription(
                            "Dudu is here as yet another multipurpose Discord bot, there's already a lot of them - but why not more? Dudu supports both slash commands and message commands, but it is recommended to use slash commands.\n\n**Dudu is currently a side-hobby project of elizielx. I'm working on it in my free time or when I'm bored, so it's not a priority.**"
                        );
                        return embed;
                    });
                    return Effect.sync(() => paginate);
                })
            );
        };
        const commandsPage = (_pagination: Effect.Effect<never, never, PaginatedMessage>) => {
            return Effect.runSync(
                Effect.all([commands, categoriesPipe, _pagination]).pipe(
                    Effect.map(([cmds, categories, paginate]) => {
                        return Effect.forEach(categories, (category) => {
                            if (category === "primary") return Effect.sync(() => paginate);

                            const categoryCommands = cmds.filter((cmd: Command): boolean => cmd.category === category);
                            const fields = categoryCommands.map((cmd: Command) => cmd);

                            const commandFields = fields.map((cmd: Command) => {
                                let command: string;
                                const commandId = this.container.applicationCommandRegistries.acquire(
                                    cmd.name
                                ).globalCommandId;

                                if (!commandId) {
                                    command = `/${cmd.name}`;
                                } else {
                                    command = chatInputApplicationCommandMention(cmd.name, commandId);
                                }

                                return { name: command, value: cmd.description, inline: true };
                            });

                            paginate.addPageEmbed((embed) => {
                                embed.setTitle(
                                    `Viewing ${category.charAt(0).toUpperCase() + category.slice(1)} commands.`
                                );
                                embed.addFields(commandFields);
                                return embed;
                            });

                            return Effect.sync(() => paginate);
                        }).pipe(Effect.map(() => paginate));
                    })
                )
            );
        };
        const selectMenuOptionsPipe = (_pagination: Effect.Effect<never, never, PaginatedMessage>) => {
            return Effect.runSync(
                Effect.all([categoriesPipe, _pagination]).pipe(
                    Effect.map(([categories, paginate]) => {
                        const selectMenuOptions = [];

                        selectMenuOptions.push(
                            ...categories.map((category) => ({
                                label: category.charAt(0).toUpperCase() + category.slice(1),
                                description:
                                    category === "primary"
                                        ? "View the primary page."
                                        : `View ${
                                              category.charAt(0).toUpperCase() + category.slice(1)
                                          }-related commands.`,
                                value: category,
                            }))
                        );

                        paginate.setActions([
                            {
                                customId: "help-command-select-menu",
                                type: ComponentType.StringSelect,
                                options: selectMenuOptions,
                                placeholder: "Select a category...",
                                run: ({ handler, interaction }) => {
                                    if (interaction.isStringSelectMenu()) {
                                        handler.index = categories.indexOf(interaction.values[0]);
                                    }
                                },
                            },
                        ]);

                        return Effect.sync(() => paginate);
                    })
                )
            );
        };
        const runPagination = (_pagination: Effect.Effect<never, never, PaginatedMessage>) => {
            return Effect.runSync(
                Effect.map(_pagination, (paginate) => {
                    return Effect.sync(() => paginate.run(ctx));
                })
            );
        };

        return pipe(pagination, primaryPage, commandsPage, selectMenuOptionsPipe, runPagination);
    }
}
