import { prisma } from '@weeklyhackathon/db';
import { analyseRepoAndSaveResult } from '@weeklyhackathon/github';
import { log } from '@weeklyhackathon/utils/log';

async function refreshAnalyses() {
  const prs = await prisma.githubPullRequest.findMany({
    include: {
      repo: true
    }
  });

  log.info(`Found ${prs.length} PRs to refresh`);

  for (const pr of prs) {
    log.info(`Refreshing analysis for ${pr.repo.owner}/${pr.repo.name}/${pr.number}`);
    await analyseRepoAndSaveResult({
      repoOwner: pr.repo.owner,
      repoName: pr.repo.name,
      forceRefresh: true
    });
  }
}

refreshAnalyses();
