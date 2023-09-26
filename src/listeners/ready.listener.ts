import { Listener } from "@sapphire/framework";

import { DuduEvents } from "@~/lib/extensions/events.extension";

export class ReadyListener extends Listener {
    constructor(context: Listener.Context) {
        super(context, {
            name: "ready",
            once: true,
            event: DuduEvents.ClientReady,
        });
    }

    async run(): Promise<void> {
        const userCount = this.container.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const guildCount = this.container.client.guilds.cache.size;

        this.container.logger.info(`ReadyListener: Logged in as ${this.container.client.user?.tag}!`);
        this.container.logger.info(`ReadyListener: Serving ${guildCount} guilds and ${userCount} users!`);
        this.container.logger.info(`ReadyListener: Loaded ${this.container.stores.get("commands").size} commands.`);
        this.container.logger.info(`ReadyListener: Loaded ${this.container.stores.get("listeners").size} listeners.`);
    }
}
