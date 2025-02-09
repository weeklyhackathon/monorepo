import { prisma } from '@weeklyhackathon/db';
import { analysePullRequest } from '@weeklyhackathon/github';
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
    await analysePullRequest({
      owner: pr.repo.owner,
      repo: pr.repo.name,
      prNumber: pr.number,
      forceRefresh: true
    });
  }
}

refreshAnalyses();
