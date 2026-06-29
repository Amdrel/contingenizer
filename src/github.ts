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

import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

export type Repo =
    RestEndpointMethodTypes["repos"]["listForAuthenticatedUser"]["response"]["data"][0];

/**
 * Get a full list of all of the user's repositories, public and private.
 */
export async function listRepos(octokit: Octokit): Promise<Repo[]> {
    const repos = await octokit.paginate(
        octokit.repos.listForAuthenticatedUser,
        { type: "owner" },
    );
    return repos as Repo[];
}
