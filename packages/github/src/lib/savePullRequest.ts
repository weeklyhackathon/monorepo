import type { GithubPullRequest } from '@weeklyhackathon/db';
import { prisma } from '@weeklyhackathon/db';
import { extractPullRequestDataFromUrl } from './extractRepoDataFromUrl';
import { saveRepo } from './saveRepo';

type SavePullRequestInput = {
  url?: string;
  owner?: string;
  name?: string;
  prNumber?: number;
  submitterId: string;
  analysis?: Pick<GithubPullRequest, 'productAnalysis' | 'technicalArchitecture'>;
};

/**
 * Saves or updates a GitHub pull request in the database
 * @param input Pull request URL or owner/name/number combination, plus submitter ID
 * @returns The saved pull request record
 * @throws Error if neither URL nor owner/name/number provided
 */
export async function savePullRequest(input: SavePullRequestInput) {
  let owner: string;
  let name: string;
  let prNumber: number;

  if (input.url) {
    const prData = extractPullRequestDataFromUrl(input.url);
    owner = prData.owner;
    name = prData.name;
    prNumber = prData.prNumber;
  } else if (input.owner && input.name && input.prNumber) {
    owner = input.owner;
    name = input.name;
    prNumber = input.prNumber;
  } else {
    throw new Error('Must provide either URL or owner/name/PR number combination');
  }

  const nameWithOwner = `${owner}/${name}`;

  // Ensure repo exists first
  await saveRepo({
    owner,
    name
  });

  return prisma.githubPullRequest.upsert({
    where: {
      githubRepoNameWithOwner_number: {
        githubRepoNameWithOwner: nameWithOwner,
        number: prNumber
      }
    },
    create: {
      submittedBy: input.submitterId,
      number: prNumber,
      githubRepoNameWithOwner: nameWithOwner,
      analysedAt: input.analysis ? new Date() : null,
      ...input.analysis
    },
    update: {
      // Only update timestamps on upsert
      updatedAt: new Date(),
      analysedAt: input.analysis ? new Date() : null,
      ...input.analysis
    }
  });
}
