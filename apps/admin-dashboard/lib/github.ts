import { env } from "@nextwave/config";

const GITHUB_API = "https://api.github.com";

export async function syncGithubRepository(owner: string, repo: string) {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: {
      Authorization: env.githubToken ? `Bearer ${env.githubToken}` : "",
      "User-Agent": "nextwave-platform"
    }
  });

  if (!response.ok) {
    return { synced: false, status: response.status };
  }

  const data = await response.json();
  return {
    synced: true,
    fullName: data.full_name,
    defaultBranch: data.default_branch,
    private: data.private
  };
}