import { NextResponse } from "next/server";
import { requirePortalContext } from "../../../../lib/auth";
import { isAdmin } from "../../../../lib/role-helper";
import { createClinicBillingPortalSession } from "../../../../lib/portal-billing";

export async function GET(request: Request) {
  try {
    const portalContext = await requirePortalContext({ allowedRoles: ["admin", "manager"], moduleKey: "billing" });
    if (!isAdmin({ role: portalContext.membership.role }) && portalContext.membership.role !== "manager") {
      throw new Error("Unauthorized");
    }
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
