import { createClinicSubscriptionCheckoutSession } from "../../../../lib/subscription";
import { requireClientModule } from "../../../../lib/authz";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      clientId?: string;
      customerEmail?: string;
      appId?: string;
    };

    if (!body.clientId) {
      return Response.json({ error: "Missing clientId" }, { status: 400 });
    }

    const actorUserId = await requireClientModule(request, body.clientId, "billing", ["admin"]);
    const origin = process.env.NEXT_PUBLIC_ADMIN_URL || new URL(request.url).origin;

    const result = await createClinicSubscriptionCheckoutSession({
      clientId: body.clientId,
      customerEmail: body.customerEmail,
      appId: body.appId ?? "medivault",
      origin
    });

    return Response.json({ ok: true, actorUserId, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed_to_create_billing_checkout";
    return Response.json({ ok: false, error: message }, { status: 403 });
  }
}
