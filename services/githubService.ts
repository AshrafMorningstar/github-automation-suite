
export interface GithubRepoConfig {
  name: string;
  description: string;
  private: boolean;
  topics: string[];
}

const handleResponse = async (response: Response, context: string) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unexpected network error' }));
    throw new Error(`[${context}] ${error.message || 'Action failed'}`);
  }
  return response.json();
};

export const createGithubRepo = async (token: string, config: GithubRepoConfig) => {
  const response = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: config.name,
      description: config.description,
      private: config.private,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      auto_init: false,
    }),
  });

  const repo = await handleResponse(response, 'Repo Creation');

  if (config.topics.length > 0) {
    await fetch(`https://api.github.com/repos/${repo.full_name}/topics`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.mercy-preview+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ names: config.topics.slice(0, 20).map(t => t.toLowerCase().replace(/[^a-z0-9-]/g, '')) }),
    });
  }

  return repo;
};

export const createGithubFile = async (token: string, owner: string, repo: string, path: string, content: string, message: string) => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: btoa(unescape(encodeURIComponent(content))),
    }),
  });

  return await handleResponse(response, `File Upload: ${path}`);
};

export const createGithubRelease = async (token: string, owner: string, repo: string, tagName: string, name: string, body: string) => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tag_name: tagName,
      name,
      body,
      draft: false,
      prerelease: false
    }),
  });
  return await handleResponse(response, 'Release Creation');
};

export const downloadRepoAsZip = (owner: string, repo: string, branch: string = 'main') => {
  const url = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
  window.open(url, '_blank');
};

export const downloadRepoFromUrl = (repoUrl: string) => {
  try {
    const url = new URL(repoUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) throw new Error("Invalid GitHub URL");
    const owner = parts[0];
    const repo = parts[1];
    downloadRepoAsZip(owner, repo);
  } catch (e) {
    alert("Invalid GitHub repository URL provided.");
  }
};
