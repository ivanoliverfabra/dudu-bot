import { createColors } from "colorette";
import "dotenv/config";
import { Config, Effect } from "effect";

import "@sapphire/plugin-logger/register";

import { DuduClient } from "@~/lib/extensions/client.extension";

import { options } from "./options";

createColors({ useColor: true });

const main = Effect.all([Effect.config(Config.string("DISCORD_BOT_TOKEN"))]).pipe(
    Effect.flatMap(([token]) => Effect.sync(() => new DuduClient(options).login(token)))
);

Effect.runSync(main);
