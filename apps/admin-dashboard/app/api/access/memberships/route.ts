import { listClientMemberships, upsertClientMembership } from "../../../../lib/access";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? undefined;
  const clientId = url.searchParams.get("clientId") ?? undefined;
  const items = await listClientMemberships(userId, clientId);
  return Response.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.userId || !body.clientId || !body.roleKey) {
    return Response.json({ error: "Missing userId, clientId, or roleKey" }, { status: 400 });
  }

  const membership = await upsertClientMembership({
    userId: body.userId,
    clientId: body.clientId,
    roleKey: body.roleKey,
    scope: body.scope,
    isActive: body.isActive
  });

  return Response.json({ saved: true, membership });
}