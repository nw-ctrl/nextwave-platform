import { NextResponse } from "next/server";
import { PORTAL_ACCESS_COOKIE, PORTAL_CLIENT_COOKIE, PORTAL_REFRESH_COOKIE } from "../../../../lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";

  for (const cookieName of [PORTAL_ACCESS_COOKIE, PORTAL_REFRESH_COOKIE, PORTAL_CLIENT_COOKIE]) {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0
    });
  }

  return response;
}
