

/**
 * Extracts the owner and repo name from a GitHub URL.
 * @param url GitHub repository URL
 * @returns Object containing owner and repo name
 * @throws Error if URL is invalid or missing owner/repo
 */
export function extractRepoDataFromUrl(url: string): { owner: string; name: string } {
  const match = extractRepoDataFromUrlOrNull(url);
  if (!match) {
    throw new Error('Invalid GitHub repository URL');
  }
  return match;
}

/**
 * Extracts the owner, repo name and PR number from a GitHub pull request URL.
 * @param url GitHub pull request URL
 * @returns Object containing owner, repo name and PR number
 * @throws Error if URL is invalid or missing required parts
 */
export function extractPullRequestDataFromUrl(url: string): { owner: string; name: string; prNumber: number } {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') {
      throw new Error('Not a GitHub URL');
    }

    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length < 4 || parts[2] !== 'pull') {
      throw new Error('Invalid GitHub pull request URL format');
    }

    const prNumber = parseInt(parts[3], 10);
    if (isNaN(prNumber)) {
      throw new Error('Invalid pull request number');
    }

    return {
      owner: parts[0],
      name: parts[1].replace('.git', ''),
      prNumber
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Invalid GitHub pull request URL');
  }
}


/**
 * Attempts to extract the owner and repo name from a GitHub URL.
 * Returns null if URL is invalid.
 * @param url GitHub repository URL
 * @returns Object containing owner and repo name, or null if invalid
 */
function extractRepoDataFromUrlOrNull(url: string): { owner: string; name: string } | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') {
      return null;
    }

    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length < 2) {
      return null;
    }

    return {
      owner: parts[0],
      name: parts[1].replace('.git', '') // Handle .git suffix if present
    };
  } catch {
    return null;
  }
}
