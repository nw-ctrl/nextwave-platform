import { listTenantFeatures, upsertTenantFeature } from "../../../../lib/tenants";
import { requireClientRole } from "../../../../lib/authz";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId") ?? undefined;
  const appId = url.searchParams.get("appId") ?? undefined;
  const items = await listTenantFeatures(clientId, appId);
  return Response.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.clientId || !body.featureKey) {
      return Response.json({ error: "Missing clientId or featureKey" }, { status: 400 });
    }

    const actorUserId = await requireClientRole(request, body.clientId, ["admin"]);

    const feature = await upsertTenantFeature({
      clientId: body.clientId,
      appId: body.appId,
      featureKey: body.featureKey,
      isEnabled: body.isEnabled,
      rollout: body.rollout,
      config: body.config
    });

    return Response.json({ saved: true, actorUserId, feature });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed_to_save_feature";
    return Response.json({ saved: false, error: message }, { status: 403 });
  }
}
