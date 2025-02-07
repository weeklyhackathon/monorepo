import type { GithubRepo } from '@weeklyhackathon/db';
import { prisma } from '@weeklyhackathon/db';

/**
 * Fetches a GitHub repository from the database by its nameWithOwner
 *
 * @param nameWithOwner Unique identifier in the format "owner/repoName"
 * @returns The repository record or null if not found
 */
export async function getRepo(nameWithOwner: string): Promise<GithubRepo | null> {
  return await prisma.githubRepo.findUnique({
    where: {
      nameWithOwner
    }
  });
}
