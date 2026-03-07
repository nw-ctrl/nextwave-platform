import { listGithubRepositories, registerGithubRepository } from "../../../../lib/github";

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId") ?? undefined;
  const items = await listGithubRepositories(clientId);
  return Response.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const repository = await registerGithubRepository({
    connectionId: body.connectionId,
    clientId: body.clientId,
    projectId: body.projectId,
    owner: body.owner,
    repo: body.repo
  });

  return Response.json({ created: true, repository });
}