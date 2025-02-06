import FormData from 'form-data';
import fetch from 'node-fetch';
import { log } from '@weeklyhackathon/utils';
import { askDeepseek } from '@weeklyhackathon/utils/askDeepseek';
import { tokenize } from '@weeklyhackathon/utils/tokenize';

// Maximum tokens for our LLM context (reserve a margin for the prompt)
const MAX_TOKENS = 58000;

// A separator to uniquely identify a repository by owner and name.

/**
 * Download the repository raw data from Gitingest.
 *
 * The function first posts a request to ingest the repo and then extracts the download link
 * from the returned HTML. Finally it downloads the repository content as a text blob.
 */
async function downloadRepoRawData(repoOwner: string, repoName: string): Promise<string> {
  const baseUrl = 'https://gitingest.com';
  const ingestUrl = `${baseUrl}/${repoOwner}/${repoName}`;

  const formData = new FormData();
  // These parameters can be adjusted to suit your repository type
  formData.append('max_file_size', '243');
  formData.append('pattern_type', 'exclude');
  formData.append(
    'pattern',
    '*.yaml,*.yml,*.toml,*.json,*.txt,*.lock,*.config,*.env,*.example,*.sample,*.log,*.csv,*.xml'
  );
  formData.append('input_text', `${repoOwner}/${repoName}`);

  log.info(`Ingesting repo ${repoOwner}/${repoName} at ${ingestUrl}`);
  const ingestResponse = await fetch(ingestUrl, {
    method: 'POST',
    body: formData
  });

  const ingestHtml = await ingestResponse.text();
  // Look for the download link in the returned HTML.
  const downloadLinkMatch = ingestHtml.match(/<a href="\/download\/([^"]+)"/);
  if (!downloadLinkMatch) {
    throw new Error('Download link not found in response from gitingest');
  }
  const downloadUrl = `${baseUrl}/download/${downloadLinkMatch[1]}`;
  log.info('Download URL:', downloadUrl);

  const downloadResponse = await fetch(downloadUrl);
  const rawData = await downloadResponse.text();

  return rawData;
}

/**
 * Represents a file or directory node from the parsed repository.
 */
export type GithubFileNode = {
  name: string;
  content?: string;
  children?: GithubFileNode[];
};

/**
 * Parse raw text (from gitingest) into a file tree.
 *
 * The raw data is expected to have sections separated by a unique delimiter.
 * Files whose paths match one of the ignorePatterns will be skipped.
 */
function parseFileTreeFromGitingest(
  input: string,
  ignorePatterns: (string | RegExp)[] = []
): GithubFileNode {
  const root: GithubFileNode = {
    name: 'root',
    children: []
  };

  // The raw data is split into sections for each file.
  const sections = input.split('================================================\nFile: ').slice(1);
  for (const section of sections) {
    const [header, ...contentLines] = section.split('\n');
    const filePath = header.trim();
    const content = contentLines.join('\n').trim();

    // If the file path matches an ignore pattern, skip it.
    if (
      ignorePatterns.some((pattern) =>
        typeof pattern === 'string'
          ? filePath.includes(pattern)
          : pattern.test(filePath)
      )
    ) {
      continue;
    }

    const parts = filePath.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      // Look for an existing child node.
      let child = current.children?.find((node) => node.name === part);
      if (!child) {
        child = {
          name: part
        };
        // For directories, initialize children.
        if (i < parts.length - 1) {
          child.children = [];
        }
        if (!current.children) current.children = [];
        current.children.push(child);
      }
      if (i === parts.length - 1) {
        // If it's a file, add its content.
        child.content = content;
      }
      current = child;
    }
  }

  return root;
}

/**
 * Build a text context for the LLM by traversing the file tree in breadth-first order.
 * We add each file's (compacted) content until we reach the MAX_TOKENS limit.
 */
async function buildRepoContext(
  fileTree: GithubFileNode,
  maxTokens: number
): Promise<string> {
  let context = '';
  let totalTokens = 0;

  const queue: { node: GithubFileNode; filePath: string }[] = [];
  if (fileTree.children) {
    for (const child of fileTree.children) {
      queue.push({
        node: child,
        filePath: child.name
      });
    }
  }

  while (queue.length > 0) {
    const {
      node, filePath
    } = queue.shift()!;

    // Enqueue children if this is a directory.
    if (node.children) {
      for (const child of node.children) {
        queue.push({
          node: child,
          filePath: `${filePath}/${child.name}`
        });
      }
    }

    // Process file content if available.
    if (node.content) {
      // Remove extra whitespace.
      const fileContent = `File: ${filePath}\n${node.content}\n\n`.replace(/\s+/g, ' ').trim();
      const tokens = await tokenize(fileContent);
      if (totalTokens + tokens.tokensCount > maxTokens) {
        log.info('Reached max tokens limit. Stopping file traversal.');
        break;
      }
      context += fileContent;
      totalTokens += tokens.tokensCount;
    }
  }

  log.info(`Built context with approx. ${totalTokens} tokens.`);
  return context;
}

/**
 * Analyze the repository for its product aspects.
 *
 * The LLM is instructed to provide a product analysis in a JSON object with:
 * - topics: a list of product-related categories
 * - productDescription: a 200-400 word explanation of the product
 */
async function analyzeProduct(context: string): Promise<{
  topics: string[];
  productDescription: string;
}> {
  const prompt = `
Please analyze the following GitHub repository code and provide a product analysis.
Focus on describing what the repository does as a product, its key functionalities, and the user benefits.
Provide a human-friendly description between 300 to 600 words.
Also include a list of 3-5 key topics or product categories (for example, fintech, e-commerce, social networking) that best describe the product.

Here is the repository code context:
${context}
`;

  return await askDeepseek({
    message: prompt,
    systemPrompt: 'You are a helpful assistant that can analyze GitHub repositories and provide product analyses based on understanding what the code does.'
  });
}

/**
 * Analyze the repository for its technical architecture.
 *
 * The LLM is instructed to provide a technical analysis in a JSON object with:
 * - technicalArchitecture: a 200-400 word description of the technical design, frameworks,
 *   key components, design patterns, and other relevant details.
 */
async function analyzeTechnical(context: string): Promise<{
  technicalArchitecture: string;
}> {
  const prompt = `
Please analyze the following GitHub repository code and provide a technical architecture analysis.
Focus on describing the technical design, main components, frameworks, design patterns, dependencies, and interactions.
Provide a human-friendly description between 300 to 600 words that explains the repository's technical structure.

Here is the repository code context:
${context}
`;

  return await askDeepseek({
    message: prompt,
    systemPrompt: 'You are a helpful assistant that can analyze GitHub repositories and provide technical architecture analyses. You identify the core modules and services that make up the system and how they are related to each other'
  });
}

/**
 * The main function that processes a GitHub repository:
 * 1. Downloads the repository raw data from Gitingest.
 * 2. Parses the file tree and builds a text context (limited by MAX_TOKENS).
 * 3. Makes two LLM calls to generate the product analysis and technical architecture analysis.
 * 4. Returns the combined result.
 */
export async function processRepo({
  repoOwner,
  repoName
}: {
  repoOwner: string;
  repoName: string;
}): Promise<{
  productAnalysis: { topics: string[]; productDescription: string };
  technicalAnalysis: { technicalArchitecture: string };
}> {
  log.info('--------------------------------');
  log.info(`Processing repo: https://github.com/${repoOwner}/${repoName}`);

  // Download the raw repository data.
  const rawData = await downloadRepoRawData(repoOwner, repoName);

  // Define ignore patterns to skip files/directories that are not useful.
  const ignorePatterns: (string | RegExp)[] = [
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
    /\.d\.ts$/  // ignore type definition files
  ];
  // Parse the raw text into a file tree.
  const fileTree = parseFileTreeFromGitingest(rawData, ignorePatterns);
  // Build a single text context for the LLM.
  const context = await buildRepoContext(fileTree, MAX_TOKENS);


  // // Get the two analyses in parallel.
  const [productAnalysis, technicalAnalysis] = await Promise.all([
    analyzeProduct(context),
    analyzeTechnical(context)
  ]);

  const enrichedData = {
    productAnalysis,
    technicalAnalysis,
    repoUrl: `https://github.com/${repoOwner}/${repoName}`
  };


  // log.info('--------------------------------');

  return enrichedData;
}
