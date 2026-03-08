import { resolveConnectionForClient } from "@nextwave/database";
import { requireClientModule } from "../../../lib/authz";

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId");
  if (!clientId) {
    return Response.json({ error: "Missing clientId" }, { status: 400 });
  }

  try {
    await requireClientModule(request, clientId, "doctors", ["admin", "manager", "staff", "viewer"]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "forbidden";
    return Response.json({ error: message }, { status: 403 });
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

  try {
    await requireClientModule(request, clientId, "doctors", ["admin", "manager", "staff"]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "forbidden";
    return Response.json({ error: message }, { status: 403 });
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
