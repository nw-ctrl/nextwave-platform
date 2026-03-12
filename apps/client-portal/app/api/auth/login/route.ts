import { NextResponse } from "next/server";
import { createSupabaseAnonClient } from "@nextwave/database";
import { listPortalMemberships, PORTAL_ACCESS_COOKIE, PORTAL_CLIENT_COOKIE, PORTAL_REFRESH_COOKIE } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return Response.json({ error: "Missing email or password" }, { status: 400 });
    }

    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email.trim(),
      password: body.password
    });

    if (error || !data.session || !data.user) {
      return Response.json({ error: error?.message ?? "Invalid credentials" }, { status: 401 });
    }

    const memberships = await listPortalMemberships(data.user.id);
    const response = NextResponse.json({
      ok: true,
      membershipCount: memberships.length,
      selectedClientId: memberships.length === 1 ? memberships[0]?.clientId ?? null : null
    });

    const secure = process.env.NODE_ENV === "production";
    response.cookies.set(PORTAL_ACCESS_COOKIE, data.session.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: data.session.expires_in ?? 60 * 60
    });
    response.cookies.set(PORTAL_REFRESH_COOKIE, data.session.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });

    if (memberships.length === 1 && memberships[0]?.clientId) {
      response.cookies.set(PORTAL_CLIENT_COOKIE, memberships[0].clientId, {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: 60 * 60 * 24 * 30
      });
    } else {
      response.cookies.set(PORTAL_CLIENT_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: 0
      });
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "login_failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
