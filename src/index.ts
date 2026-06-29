#!/usr/bin/env node

// Copyright (C) 2026 Jamie Kuppens
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import args from "command-line-args";
import { sync } from "./commands/sync.js";
import { usage } from "./commands/usage.js";
import { init } from "./commands/init.js";

async function main() {
    const definitions: args.OptionDefinition[] = [
        { name: "name", defaultOption: true },
    ];
    const command = args(definitions, { stopAtFirstUnknown: true });
    const argv = command._unknown || [];

    try {
        switch (command.name) {
            case "init":
                await init(argv);
                break;
            case "sync":
                await sync(argv);
                break;
            default:
                await usage(argv);
        }
    } catch (err) {
        if (err instanceof TypeError) {
            console.error(err.stack ?? `${err}`);
        } else {
            console.error(`${err}`);
        }
        process.exit(1);
    }

    // sync - Take workspace path argument
    // init - Take workspace path argument
    // Read config, get GH credentials
    // Call API (bulk if possible) and get last updated against FS timestamp
    // Fetch and mirror sync any repo with newer TS than FS
    // Update TS in cached file in workspace to pushed_at for EACH repo
}

if (import.meta.main) {
    await main();
}
