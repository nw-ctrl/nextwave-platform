import { NextResponse } from "next/server";
import { getPortalSession, PORTAL_CLIENT_COOKIE } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getPortalSession();
    if (!session) {
      return Response.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = (await request.json()) as { clientId?: string };
    if (!body.clientId) {
      return Response.json({ error: "Missing clientId" }, { status: 400 });
    }

    const membership = session.memberships.find((item) => item.clientId === body.clientId);
    if (!membership) {
      return Response.json({ error: "Clinic access denied" }, { status: 403 });
    }

    const response = NextResponse.json({ ok: true, clientId: membership.clientId });
    response.cookies.set(PORTAL_CLIENT_COOKIE, membership.clientId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "clinic_selection_failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
