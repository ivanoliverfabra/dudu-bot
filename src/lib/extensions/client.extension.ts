import { ClientOptions } from "discord.js";

import {
    ApplicationCommandRegistries,
    RegisterBehavior,
    SapphireClient,
    SapphireClientOptions,
} from "@sapphire/framework";

export interface DuduClientOptions extends SapphireClientOptions, ClientOptions {}

export class DuduClient extends SapphireClient {
    constructor(options: DuduClientOptions) {
        super(options);

        ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
    }
}
