import { prisma } from '@weeklyhackathon/db';
import { analyseRepoAndSaveResult } from '@weeklyhackathon/github';
import { log } from '@weeklyhackathon/utils';

export async function refreshMissingRepoAnalyses(): Promise<void> {
  log.info('Analysing repos');

  const repos = await prisma.githubRepo.findMany({
    where: {
      reviewedAt: null
    }
  });

  for (const repo of repos) {

    try {
      await analyseRepoAndSaveResult({
        repoOwner: repo.owner,
        repoName: repo.name
      });
    } catch (error) {
      log.error(`Error analysing repo ${repo.owner}/${repo.name}`, error);
    }
  }
}
