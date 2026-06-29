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
import { stat } from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { Octokit } from "@octokit/rest";
import { configExists, readConfig, writeConfig } from "../config.js";
import { listRepos, Repo } from "../github.js";
import { join } from "node:path";

const execAsync = promisify(exec);

/**
 * Update all repository mirrors in a Contingenizer directory.
 */
export async function sync(argv: string[]): Promise<void> {
    const definitions: args.OptionDefinition[] = [
        { name: "destination", alias: "d", type: String },
    ];
    const options = args(definitions, { argv });

    if (!options.destination) {
        throw new Error("Destination is required");
    }

    const exists = await configExists(options.destination);
    if (!exists) {
        throw new Error("Contingenizer is not setup at destination");
    }

    const config = await readConfig(options.destination);
    if (!config.token.startsWith("github_pat_")) {
        throw new Error("Provided token is not a GitHub PAT");
    }
    if (!config.repos) {
        config.repos = {};
    }

    const octokit = new Octokit({ auth: config.token });
    const repos = await listRepos(octokit);
    console.log(`Found ${repos.length} repositories to sync`);

    for (const repo of repos) {
        const path = join(options.destination, `${repo.name}.git`);
        const repoExists = await stat(path, { throwIfNoEntry: false });

        if (repoExists) {
            await syncMirror(path, repo, config.repos[repo.name]);
        } else {
            await setupMirror(path, repo, config.token);
        }

        // Track timestamps so we don't make wasted calls to the git server.
        config.repos[repo.name] = repo.pushed_at;
    }

    await writeConfig(options.destination, config);
}

/**
 * Setup and sync a new mirror that hasn't been encountered yet.
 */
async function setupMirror(
    path: string,
    repo: Repo,
    token: string,
): Promise<void> {
    console.log(`Cloning new git mirror for: ${repo.name}`);

    const url = `https://${token}@github.com/${repo.owner.login}/${repo.name}`;
    await execAsync(`git clone --mirror ${url} ${path}`);
}

/**
 * Sync an existing mirror that has already been setup.
 */
async function syncMirror(
    path: string,
    repo: Repo,
    timestamp: string | null,
): Promise<void> {
    const latest = repo.pushed_at != null ? new Date(repo.pushed_at) : null;
    const saved = timestamp != null ? new Date(timestamp) : null;

    // TODO: Update the PAT stored in the config if it changes.
    if (latest && saved && saved.getTime() < latest.getTime()) {
        console.log(`Syncing mirror for ${repo.name} at: ${path}`);
        await execAsync(`git remote update`, { cwd: path });
    }
}
