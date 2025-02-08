import type { GithubPullRequest, GithubRepo } from '@weeklyhackathon/db';
import { getPullRequestDiff } from './getPullRequestDiff';
import { getPullRequestsFromLastWeek } from './getPullRequestsFromLastWeek';
import { getRepo } from './getRepo';

export type EnrichedPullRequest = {
  pullRequest: GithubPullRequest;
  repo: GithubRepo;
  diff: string;
}

/**
 * Fetches all pull requests created in the last week and their repositories
 * with enriched data
 *
 * @returns An array of objects, each containing a enriched pull request
 */
export async function getEnrichedPullRequests(): Promise<EnrichedPullRequest[]> {
  // Get all pull requests created in the last week
  const pullRequests = await getPullRequestsFromLastWeek();

  // Create a set to store unique repositories
  const repoSet = new Set<string>();
  pullRequests.forEach(pr => repoSet.add(pr.githubRepoNameWithOwner));

  // fetching repos
  const repoPromises =
    Array.from(repoSet).map(async (nameWithOwner: string) => await getRepo(nameWithOwner));
  const repos = await Promise.all(repoPromises);

  // remove not valid or missing repos
  const validRepos = repos.filter((repo): repo is GithubRepo => repo !== null);

  const enrichedPrs: EnrichedPullRequest[] = [];
  // iterate pull requests
  for (const pullRequest of pullRequests) {
    // iterate repos
    validRepos.map(async (repo: GithubRepo) => {
      // matching repos and PRs again
      if (pullRequest.githubRepoNameWithOwner === repo.nameWithOwner) {
        // fetch pull request diff
        const diff = await getPullRequestDiff({
          owner: repo.owner,
          repo: repo.name,
          prNumber: pullRequest.number
        });
        // return the enriched pr
        enrichedPrs.push({
          repo,
          pullRequest,
          diff
        });
      }
    });
  }

  return enrichedPrs;
}
