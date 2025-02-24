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

async function testFetchLastWeekPRs() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setTime(oneWeekAgo.getTime() -  (7 * 60 * 60 * 24 * 1000 * 4));
  
  const prs = await prisma.githubPullRequest.findMany({
      where: {
        submittedAt: {
          gte: oneWeekAgo
        },
        score: 0
      }
  });
  log.info(`Found ${prs.length} PRs`);
  log.info(prs);
}

async function testScore() {
  const res = await prisma.githubPullRequest.update({
    where: {
      id: "3cd00033-a4d7-4af0-9bd0-d23a45775cc7"
    },
    data: {
      score: 0
    }
  });
  log.info(res);
}

//script();
