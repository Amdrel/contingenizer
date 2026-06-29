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

import { join } from "node:path";
import { readFile, writeFile, stat } from "node:fs/promises";

const CONFIG_NAME = "contingenizer.json";

type RepoConfig = {
    token: string;
    repos?: Record<string, string | null>; // repo -> iso timestamp
};

/**
 * Check if Contingenizer is already initialized at a path.
 */
export async function configExists(path: string): Promise<boolean> {
    const stats = await stat(join(path, CONFIG_NAME), {
        throwIfNoEntry: false,
    });
    return stats != null && stats.isFile();
}

/**
 * Return the Contingenizer config for the given path.
 */
export async function readConfig(path: string): Promise<RepoConfig> {
    const data = await readFile(join(path, CONFIG_NAME), { encoding: "utf8" });

    // TODO: Add proper validation.
    return JSON.parse(data);
}

/**
 * Write a Contingenizer config.
 */
export async function writeConfig(
    path: string,
    config: RepoConfig,
): Promise<void> {
    return writeFile(join(path, CONFIG_NAME), JSON.stringify(config, null, 2));
}
