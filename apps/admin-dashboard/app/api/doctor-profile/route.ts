import { resolveConnectionForClient } from "@nextwave/database";

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId");
  if (!clientId) {
    return Response.json({ error: "Missing clientId" }, { status: 400 });
  }

  const resolved = await resolveConnectionForClient(clientId);
  if (!resolved) {
    return Response.json({ error: "No active connection found for client" }, { status: 404 });
  }

  return Response.json({
    doctorProfile: null,
    router: {
      connectionId: resolved.id,
      adapter: resolved.adapter,
      scope: resolved.scope
    }
  });
}

export async function PUT(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId");
  if (!clientId) {
    return Response.json({ error: "Missing clientId" }, { status: 400 });
  }

  const resolved = await resolveConnectionForClient(clientId);
  if (!resolved) {
    return Response.json({ error: "No active connection found for client" }, { status: 404 });
  }

  const data = await request.json();
  return Response.json({
    updated: true,
    data,
    router: {
      connectionId: resolved.id,
      adapter: resolved.adapter,
      scope: resolved.scope
    }
  });
}
