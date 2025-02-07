import type { GithubPullRequest } from '@weeklyhackathon/db';
import { prisma } from '@weeklyhackathon/db';

/**
 * Retrieves the top8 pull requests created in the last week from the database
 *
 * @returns An array of the top pull request records created in the last week
 */
export async function getTopScoresFromLastWeek() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  /// TODO: must use a fixed timestamp to set the start  

  return await prisma.githubPullRequest.findMany({
    where: {
      submittedAt: {
        gte: oneWeekAgo
      }
    },    
    orderBy: {
      score: 'desc',
    },
    take: 8,
  });
}
