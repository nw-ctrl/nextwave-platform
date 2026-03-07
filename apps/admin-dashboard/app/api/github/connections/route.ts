import { createGithubConnection, listGithubConnections } from "../../../../lib/github";

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId") ?? undefined;
  const items = await listGithubConnections(clientId);
  return Response.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const connection = await createGithubConnection({
    clientId: body.clientId,
    name: body.name,
    owner: body.owner,
    authType: body.authType,
    tokenRef: body.tokenRef,
    installationId: body.installationId
  });

  return Response.json({ created: true, connection });
}