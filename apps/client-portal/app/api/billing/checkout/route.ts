import { createClinicPortalCheckoutSession } from "../../../../lib/billing";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      clientId?: string;
      userId?: string;
      customerEmail?: string;
    };

    if (!body.clientId || !body.userId) {
      return Response.json({ error: "Missing clientId or userId" }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_PORTAL_ORIGIN || new URL(request.url).origin;
    const result = await createClinicPortalCheckoutSession({
      clientId: body.clientId,
      userId: body.userId,
      customerEmail: body.customerEmail,
      origin
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed_to_create_clinic_checkout";
    return Response.json({ ok: false, error: message }, { status: 403 });
  }
}
