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
