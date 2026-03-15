import { NextResponse } from "next/server";
import { getTierRecommendation } from "../../../../lib/billing";
import { requirePortalContext } from "../../../../lib/auth";

export async function GET(request: Request) {
  try {
    const portalContext = await requirePortalContext({ allowedRoles: ["admin", "manager"], moduleKey: "billing" });
    const recommendation = await getTierRecommendation(portalContext.clientId);
    return NextResponse.json({ ok: true, recommendation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch recommendation";
    const status = message === "Unauthenticated" ? 401 : message.includes("denied") || message.includes("required") ? 403 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
