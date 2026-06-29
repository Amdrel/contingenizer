/**
 * Get a full list of all of the user's repositories, public and private.
 */
export async function listUserRepositories(octokit: Octokit, username: string) {
    return octokit.paginate(octokit.repos.listForUser, {
        username,
        type: "all",
    });
}
