import { prisma } from '@weeklyhackathon/db';
import { analysePullRequest } from '@weeklyhackathon/github';
import { log } from '@weeklyhackathon/utils';

export async function refreshMissingPRAnalyses(): Promise<void> {
  log.info('Analysing repos');

  const prs = await prisma.githubPullRequest.findMany({
    where: {
      submittedAt: {
        lte: new Date(Date.now() - 15 * 60 * 1000)
      },
      analysedAt: null
    },
    include: {
      repo: true
    }
  });

  for (const pr of prs) {

    try {
      await analysePullRequest({
        owner: pr.repo.owner,
        repo: pr.repo.name,
        prNumber: pr.number,
        forceRefresh: true
      });
    } catch (error) {
      log.error(`Error analysing repo ${pr.githubRepoNameWithOwner}/${pr.number}`, error);
    }
  }
}
