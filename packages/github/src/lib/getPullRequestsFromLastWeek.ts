import type { GithubPullRequest } from '@weeklyhackathon/db';
import { prisma } from '@weeklyhackathon/db';

/**
 * Retrieves all GitHub pull requests created in the last week from the database
 *
 * @returns An array of pull request records created in the last week
 */
/// TODO: must check if the repos are already reviewed
export async function getPullRequestsFromLastWeek(): Promise<GithubPullRequest[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  /// TODO: must use a fixed timestamp to set the start

  return prisma.githubPullRequest.findMany({
    where: {
      submittedAt: {
        gte: oneWeekAgo
      }
    }
  });
}
