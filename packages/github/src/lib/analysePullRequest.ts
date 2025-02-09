import type { GithubPullRequest } from '@weeklyhackathon/db';
import { prisma } from '@weeklyhackathon/db';
import { askDeepseek } from '@weeklyhackathon/utils/askDeepseek';
import { analyseRepoAndSaveResult } from './analyseRepo';
import { getPullRequestDiff } from './getPullRequestDiff';

export async function analysePullRequest({
  owner,
  repo,
  prNumber,
  forceRefresh = false
}: {
  owner: string;
  repo: string;
  prNumber: number;
  forceRefresh?: boolean;
}): Promise<Pick<GithubPullRequest, 'productAnalysis' | 'technicalArchitecture'>> {

  if (!forceRefresh) {
    const pr = await prisma.githubPullRequest.findUnique({
      where: {
        githubRepoNameWithOwner_number: {
          githubRepoNameWithOwner: `${owner}/${repo}`,
          number: prNumber
        }
      }
    });

    if (pr && pr.analysedAt && pr.technicalArchitecture && pr.productAnalysis) {
      return {
        productAnalysis: pr.productAnalysis,
        technicalArchitecture: pr.technicalArchitecture
      };
    }
  }

  const diff = await getPullRequestDiff({
    owner,
    repo,
    prNumber
  });

  const repoSummary = await analyseRepoAndSaveResult({
    repoOwner: owner,
    repoName: repo,
    forceRefresh
  });

  const prompt = `
  Here is the summary of the repository:
  ${repoSummary.summary}

  Here is what the product description of the repository is:
  ${repoSummary.productDescription}

  Here is what the technical architecture of the repository is:
  ${repoSummary.technicalArchitecture}


  ---- Pull request to analyse ----
  Here is the pull request diff:
  ${diff}

  Please provide a summary of the changes in the pull request that will impact the user-facing product.
  `;

  const productAnalysis = await askDeepseek({
    message: prompt,
    systemPrompt: 'You are a product-focused assistant that analyzes pull requests from a user experience perspective. Focus on how the changes will affect end users, product features, UI/UX improvements, and business value. Do not include technical implementation details.'
  });

  const technicalAnalysis = await askDeepseek({
    message: prompt,
    systemPrompt: 'You are a technical assistant that analyzes pull requests from an engineering perspective. Focus on code quality, architectural changes, technical debt, performance implications, and implementation details. Do not include user-facing or product-level changes.'
  });

  return prisma.githubPullRequest.update({
    where: {
      githubRepoNameWithOwner_number: {
        githubRepoNameWithOwner: `${owner}/${repo}`,
        number: prNumber
      }
    },
    data: {
      analysedAt: new Date(),
      productAnalysis,
      technicalArchitecture: technicalAnalysis
    }
  });

}
