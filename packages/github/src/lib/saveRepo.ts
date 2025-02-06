import type { GithubRepo } from '@weeklyhackathon/db';
import { prisma } from '@weeklyhackathon/db';
import { extractRepoDataFromUrl } from './extractRepoDataFromUrl';

type SaveRepoInput = {
  url?: string;
  owner?: string;
  name?: string;
  analysis?: Pick<GithubRepo, 'summary' | 'productDescription' | 'technicalArchitecture'>;
};

/**
 * Saves or updates a GitHub repository in the database
 * @param input Repository URL or owner/name pair
 * @returns The saved repository record
 * @throws Error if neither URL nor owner/name provided
 */
export async function saveRepo(input: SaveRepoInput) {
  let owner: string;
  let name: string;

  if (input.url) {
    const repoData = extractRepoDataFromUrl(input.url);
    owner = repoData.owner;
    name = repoData.name;
  } else if (input.owner && input.name) {
    owner = input.owner;
    name = input.name;
  } else {
    throw new Error('Must provide either URL or owner/name pair');
  }

  const nameWithOwner = `${owner}/${name}`;

  return prisma.githubRepo.upsert({
    where: {
      nameWithOwner
    },
    create: {
      owner,
      name,
      nameWithOwner,
      reviewedAt: input.analysis ? new Date() : undefined,
      ...input.analysis
    },
    update: {
      // Only update timestamps on upsert
      updatedAt: new Date(),
      reviewedAt: input.analysis ? new Date() : undefined,
      ...input.analysis
    }
  });
}
