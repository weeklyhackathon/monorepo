import { prisma } from '@weeklyhackathon/db';
import { log } from '@weeklyhackathon/utils/log';

async function script() {
  const prs = await prisma.githubPullRequest.findMany({
    where: {
      analysedAt: {
        not: null
      }
    },
    include: {
      repo: true
    }
  });

  log.info(`Found ${prs.length} PRs`);
}

script();
