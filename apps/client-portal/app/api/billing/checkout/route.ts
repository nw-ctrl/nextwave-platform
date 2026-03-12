import { createClinicPortalCheckoutSession } from "../../../../lib/billing";
import { requirePortalContext } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      clientId?: string;
      customerEmail?: string;
    };
    const portalContext = await requirePortalContext({ allowedRoles: ["admin", "manager"], moduleKey: "billing" });
    if (body.clientId && body.clientId !== portalContext.clientId) {
      return Response.json({ error: "Clinic context mismatch" }, { status: 403 });
    }

    const origin = process.env.NEXT_PUBLIC_PORTAL_ORIGIN || new URL(request.url).origin;
    const result = await createClinicPortalCheckoutSession({
      clientId: portalContext.clientId,
      userId: portalContext.userId,
      customerEmail: body.customerEmail,
      origin
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed_to_create_clinic_checkout";
    const status = message === "Unauthenticated" ? 401 : message.includes("denied") || message.includes("required") ? 403 : 500;
    return Response.json({ ok: false, error: message }, { status });
  }
}
