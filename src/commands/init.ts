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

import { mkdir, stat } from "node:fs/promises";
import args from "command-line-args";
import { Octokit } from "@octokit/rest";
import { read } from "read";
import { configExists, writeConfig } from "../config.js";

/**
 * Initializes the tool in a specific directory with a config file.
 */
export async function init(argv: string[]): void {
    const definitions: args.OptionDefinition[] = [
        { name: "username", alias: "u", type: String },
        { name: "destination", alias: "d", type: String },
    ];
    const options = args(definitions, { argv });

    if (!options.username) {
        throw new Error("Username is required");
    }
    if (!options.destination) {
        throw new Error("Destination is required");
    }

    if (configExists(options.destination)) {
        throw new Error("Contingenizer is already initialized at destination");
    }

    // Setup the repository directory where the config and repos will live.
    const stats = await stat(options.destination, { throwIfNoEntry: false });
    if (stats && !stats.isDirectory()) {
        throw new Error("Destination already exists and is not a directory");
    } else {
        await mkdir(options.destination, { recursive: true });
    }

    // Get from stdin to avoid having the PAT in the user's shell history.
    const token = await read({ prompt: "Token: ", silent: true, replace: "*" });
    if (!token.startsWith("github_pat_")) {
        throw new Error("Provided token is not a GitHub PAT");
    }

    // Verify the PAT is valid by fetching the user's repositories.
    const octokit = new Octokit({ auth: token });
    const repos = await listUserRepositories(octokit, options.username);
    console.log(`Found ${repos.length} repositories`);

    await writeConfig(options.destination, { token });
    console.log("Contingenizer successfully initialized");
}

/**
 * Get a full list of all of the user's repositories, public and private.
 */
async function listUserRepositories(octokit: Octokit, username: string) {
    return octokit.paginate(octokit.repos.listForUser, {
        username,
        type: "all",
    });
}
