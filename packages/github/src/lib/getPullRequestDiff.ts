import { log } from '@weeklyhackathon/utils';

// Define ignore patterns to skip files/directories that are not useful.
const ignorePatterns = [
  '__tests__',
  '__mocks__',
  'test',
  'spec',
  'config',
  'temp',
  'dist',
  'build',
  'node_modules',
  '.git',
  '.github',
  '.vscode',
  'docs',
  'examples',
  'docker',
  /\.d\.ts$/,  // ignore type definition files
  'package-lock.json',
  'yarn.lock',
  'package.json'
];

interface PRDiffParams {
  owner: string;           // Repo owner
  repo: string;           // Repo name
  prNumber: number;      // Pull Request number
}

export async function getPullRequestDiff(params: PRDiffParams): Promise<string> {
  const { owner, repo, prNumber } = params;
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;

  const headers: { [key: string]: string } = {
    'Accept': 'application/vnd.github.v3.diff'
  };

  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      log.log(`Failed to fetch PR diff: ${response.statusText}`);
    }

    const diff = await response.text();
    
    return filterDiff(diff, ignorePatterns);
  } catch (err) {
    log.error('Error fetching pull request diff');
    log.error(err);
  }
  return "";
}


function filterDiff(diff: string, ignorePatterns: (string | RegExp)[]): string {
  // Convert string patterns to RegExp
  const regexPatterns = ignorePatterns.map(pattern => {
    if (typeof pattern === 'string') {
      // Escape special characters in string patterns and create a regex pattern for the file
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`^diff --git a/${escapedPattern} b/${escapedPattern}.*?(?=^diff --git a/|^$)`, 'ms');
    } else {
      // Directly use RegExp patterns
      return pattern;
    }
  });

  // Apply each regex pattern to filter the diff
  let filteredDiff = diff;
  for (const pattern of regexPatterns) {
    filteredDiff = filteredDiff.replace(pattern, '');
  }

  // Clean up any remaining empty lines that may have been left after removal
  filteredDiff = filteredDiff.replace(/^\s*[\r\n]/gm, '');

  return filteredDiff;
}

