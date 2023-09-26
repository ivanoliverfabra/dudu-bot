import { EmbedBuilder, GuildMember, Message, SlashCommandBuilder, User } from "discord.js";

import { Args, RegisterBehavior } from "@sapphire/framework";

import { DuduCommand } from "@~/lib/extensions/command.extension";

export class AvatarCommand extends DuduCommand {
    constructor(context: DuduCommand.Context, options: DuduCommand.Options) {
        super(context, {
            ...options,
            name: "avatar",
            aliases: ["av"],
            description: "Display the user's avatar(s)",
        });
    }

    override registerApplicationCommands(registry: DuduCommand.Registry) {
        const command: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option.setName("user").setDescription("Get user's avatar(s)").setRequired(false)
            );

        registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    async chatInputRun(interaction: DuduCommand.ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user") ?? interaction.user;
        return this.getAvatarURL(user, interaction);
    }

    async messageRun(message: Message, args: Args) {
        const user = await args.pick("user").catch(() => message.author);
        return this.getAvatarURL(user, message);
    }

    private async getAvatarURL(user: User, ctx: Message | DuduCommand.ChatInputCommandInteraction) {
        const userInGuild = (await ctx.guild?.members.fetch(user.id)) as GuildMember;

        const iconURL: string = user.displayAvatarURL({ size: 4096 });
        const userInGuildIconURL: string = userInGuild?.displayAvatarURL({ size: 4096 });

        const avatarEmbed = [
            new EmbedBuilder().setImage(iconURL).setAuthor({ name: user.tag, iconURL }),
            new EmbedBuilder().setImage(userInGuildIconURL),
        ];

        if (user.displayAvatarURL() !== userInGuild.displayAvatarURL()) {
            return ctx.reply({ embeds: avatarEmbed });
        }

        return ctx.reply({ embeds: [avatarEmbed[0]] });
    }
}
