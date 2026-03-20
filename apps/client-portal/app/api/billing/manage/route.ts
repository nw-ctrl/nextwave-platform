import { NextResponse } from "next/server";
import { requirePortalContext } from "../../../../lib/auth";
import { createClinicBillingPortalSession } from "../../../../lib/portal-billing";

export async function GET(request: Request) {
  try {
    const portalContext = await requirePortalContext({ allowedRoles: ["admin", "manager"], moduleKey: "billing" });
    const origin = process.env.NEXT_PUBLIC_PORTAL_ORIGIN || new URL(request.url).origin;
    const session = await createClinicBillingPortalSession({
      clientId: portalContext.clientId,
      origin
    });

    return NextResponse.redirect(session.url, { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed_to_create_billing_portal_session";
    const redirectUrl = new URL("/billing", request.url);
    redirectUrl.searchParams.set("portal", "error");
    redirectUrl.searchParams.set("message", message);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }
}
