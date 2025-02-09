import type { GithubPullRequest } from '@weeklyhackathon/db';
import { prisma } from '@weeklyhackathon/db';

/**
 * Retrieves all GitHub pull requests created in the last week from the database
 *
 * @returns An array of pull request records created in the last week
 */
export async function getPullRequestsFromLastWeek(): Promise<GithubPullRequest[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setTime(oneWeekAgo.getTime() -  (7 * 60 * 60 * 24 * 1000));
  /// TODO: must use a fixed timestamp to set the start

  return await prisma.githubPullRequest.findMany({
    where: {
      submittedAt: {
        gte: oneWeekAgo
      },
      score: 0
    }
  });
}
