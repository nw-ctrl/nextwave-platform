import { getTenantBootstrap } from "../../../../lib/tenants";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId");
  const appId = url.searchParams.get("appId") ?? undefined;

  if (!clientId) {
    return Response.json({ error: "Missing clientId" }, { status: 400 });
  }

  const payload = await getTenantBootstrap({ clientId, appId });
  return Response.json(payload);
}