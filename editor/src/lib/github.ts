import { Octokit } from '@octokit/rest';
import type { PortfolioData } from '../types/portfolio';

const PORTFOLIO_REPO_OWNER = 'Michael0424H';
const PORTFOLIO_REPO_NAME = 'michael0424h.github.io';
const PORTFOLIO_FILE_PATH = 'portfolio.json';
const PORTFOLIO_SITE_URL = 'https://michael0424h.github.io';

export interface GitHubSettings {
  token: string;
}

function getOctokit(token: string) {
  return new Octokit({ auth: token });
}

export async function loadPortfolioFromGitHub(token: string): Promise<PortfolioData> {
  const octokit = getOctokit(token);
  const { data } = await octokit.repos.getContent({
    owner: PORTFOLIO_REPO_OWNER,
    repo: PORTFOLIO_REPO_NAME,
    path: PORTFOLIO_FILE_PATH,
  });
  if (!('content' in data)) throw new Error('Not a file');
  const binary = atob(data.content.replace(/\n/g, ''));
  const bytes = new Uint8Array(Array.from(binary, c => c.charCodeAt(0)));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function publishPortfolioToGitHub(
  token: string,
  data: PortfolioData,
  message = 'Update portfolio content'
): Promise<void> {
  const octokit = getOctokit(token);

  // Get current SHA
  let sha: string | undefined;
  try {
    const { data: existing } = await octokit.repos.getContent({
      owner: PORTFOLIO_REPO_OWNER,
      repo: PORTFOLIO_REPO_NAME,
      path: PORTFOLIO_FILE_PATH,
    });
    if ('sha' in existing) sha = existing.sha;
  } catch {
    // File doesn't exist yet — will create it
  }

  const json = JSON.stringify(data, null, 2);
  const bytes = new TextEncoder().encode(json);
  const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
  const content = btoa(binary);

  await octokit.repos.createOrUpdateFileContents({
    owner: PORTFOLIO_REPO_OWNER,
    repo: PORTFOLIO_REPO_NAME,
    path: PORTFOLIO_FILE_PATH,
    message,
    content,
    sha,
  });
}

export async function uploadImageToGitHub(token: string, file: File): Promise<string> {
  const octokit = getOctokit(token);
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `images/${name}`;

  const buffer = await file.arrayBuffer();
  const binary = Array.from(new Uint8Array(buffer)).map(b => String.fromCharCode(b)).join('');
  const content = btoa(binary);

  await octokit.repos.createOrUpdateFileContents({
    owner: PORTFOLIO_REPO_OWNER,
    repo: PORTFOLIO_REPO_NAME,
    path,
    message: `Upload image: ${name}`,
    content,
  });

  return `${PORTFOLIO_SITE_URL}/${path}`;
}

export { PORTFOLIO_SITE_URL };
