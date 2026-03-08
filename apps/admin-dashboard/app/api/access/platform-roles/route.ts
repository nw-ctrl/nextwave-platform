import { listPlatformRoles, upsertPlatformRole } from "../../../../lib/access";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId") ?? undefined;
  const items = await listPlatformRoles(userId);
  return Response.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.userId || !body.roleKey) {
    return Response.json({ error: "Missing userId or roleKey" }, { status: 400 });
  }

  const role = await upsertPlatformRole({
    userId: body.userId,
    roleKey: body.roleKey,
    isActive: body.isActive
  });

  return Response.json({ saved: true, role });
}