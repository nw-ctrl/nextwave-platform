import { testConnectionById, testConnectionProfile } from "../../../../lib/databases";

export async function POST(request: Request) {
  const body = await request.json();

  if (body.connectionId) {
    const result = await testConnectionById(body.connectionId);
    return Response.json({ ok: true, result });
  }

  if (!body.adapter) {
    return Response.json({ error: "Missing adapter or connectionId" }, { status: 400 });
  }

  const result = await testConnectionProfile({
    adapter: body.adapter,
    connectionRef: body.connectionRef,
    config: body.config
  });

  return Response.json({ ok: true, result });
}