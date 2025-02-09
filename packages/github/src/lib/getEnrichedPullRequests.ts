import type { GithubPullRequest, GithubRepo } from '@weeklyhackathon/db';
import { getPullRequestDiff } from './getPullRequestDiff';
import { getPullRequestsFromLastWeek } from './getPullRequestsFromLastWeek';
import { getRepo } from './getRepo';

export type EnrichedPullRequest = {
  pullRequest?: GithubPullRequest;
  repo?: GithubRepo;
  diff?: string;
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

  const enrichedPrs: EnrichedPullRequest[] = [];
  // iterate pull requests
  for (const pullRequest of pullRequests) {
    // fetch repo
    const repo = await getRepo(pullRequest?.githubRepoNameWithOwner) || undefined; 
    // fetch pull request diff
    const diff = await getPullRequestDiff({
      owner: repo?.owner ?? "",
      repo: repo?.name ?? "",
      prNumber: pullRequest?.number ?? ""
    });

    // return the enriched pr
    enrichedPrs.push({
      repo,
      pullRequest,
      diff
    });
  }

  return enrichedPrs;
}
