import { createSupabaseServiceClient } from "@nextwave/database";
import { env } from "@nextwave/config";

const GITHUB_API = "https://api.github.com";

export type GithubConnectionInput = {
  clientId?: string;
  name: string;
  owner: string;
  authType?: "token" | "app";
  tokenRef?: string;
  installationId?: string;
};

export async function syncGithubRepository(owner: string, repo: string, token?: string) {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : env.githubToken ? `Bearer ${env.githubToken}` : "",
      "User-Agent": "nextwave-platform"
    }
  });

  if (!response.ok) {
    return { synced: false, status: response.status };
  }

  const data = await response.json();
  return {
    synced: true,
    fullName: data.full_name as string,
    defaultBranch: data.default_branch as string,
    private: Boolean(data.private)
  };
}

export async function listGithubConnections(clientId?: string) {
  const supabase = createSupabaseServiceClient();
  let query = supabase.from("github_connections").select("*").order("created_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createGithubConnection(input: GithubConnectionInput) {
  const supabase = createSupabaseServiceClient();
  const payload = {
    client_id: input.clientId ?? null,
    name: input.name,
    owner: input.owner,
    auth_type: input.authType ?? "token",
    token_ref: input.tokenRef ?? null,
    installation_id: input.installationId ?? null
  };

  const { data, error } = await supabase.from("github_connections").insert(payload).select("*").single();
  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listGithubRepositories(clientId?: string) {
  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("github_repositories")
    .select("*")
    .order("updated_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function registerGithubRepository(input: {
  connectionId: string;
  clientId?: string;
  projectId?: string;
  owner: string;
  repo: string;
}) {
  const synced = await syncGithubRepository(input.owner, input.repo);
  if (!synced.synced) {
    throw new Error(`GitHub sync failed with status ${synced.status}`);
  }

  const supabase = createSupabaseServiceClient();
  const payload = {
    connection_id: input.connectionId,
    client_id: input.clientId ?? null,
    project_id: input.projectId ?? null,
    owner: input.owner,
    repo: input.repo,
    full_name: synced.fullName,
    default_branch: synced.defaultBranch,
    is_private: synced.private,
    metadata: {}
  };

  const { data, error } = await supabase
    .from("github_repositories")
    .upsert(payload, { onConflict: "connection_id,owner,repo" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
