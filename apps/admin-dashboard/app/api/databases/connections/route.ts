import { listConnections, saveConnection } from "../../../../lib/databases";

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId") ?? undefined;
  const items = await listConnections(clientId);
  return Response.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.adapter) {
      return Response.json({ error: "Missing adapter" }, { status: 400 });
    }

    const connection = await saveConnection({
      id: body.id,
      clientId: body.clientId,
      projectId: body.projectId,
      adapter: body.adapter,
      connectionRef: body.connectionRef,
      config: body.config,
      isActive: body.isActive
    });

    return Response.json({ saved: true, connection });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed_to_save_connection";
    return Response.json({ saved: false, error: message }, { status: 500 });
  }
}
