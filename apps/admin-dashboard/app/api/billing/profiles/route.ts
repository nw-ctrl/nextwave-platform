import { listBillingProfiles, upsertBillingProfile } from "../../../../lib/subscription";
import { requireClientRole } from "../../../../lib/authz";

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId") ?? undefined;
  const items = await listBillingProfiles(clientId);
  return Response.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.clientId) {
      return Response.json({ error: "Missing clientId" }, { status: 400 });
    }

    const actorUserId = await requireClientRole(request, body.clientId, ["admin"]);

    const profile = await upsertBillingProfile({
      clientId: body.clientId,
      mode: body.mode,
      stripeAccountId: body.stripeAccountId,
      stripeCustomerId: body.stripeCustomerId,
      keyRef: body.keyRef,
      webhookSecretRef: body.webhookSecretRef,
      metadata: body.metadata
    });

    return Response.json({ saved: true, actorUserId, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed_to_save_billing_profile";
    return Response.json({ saved: false, error: message }, { status: 403 });
  }
}
