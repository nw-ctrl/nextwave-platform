import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function resolveTenantSlug(host: string | null) {
  if (!host) {
    return null;
  }

  const normalizedHost = host.split(":")[0].toLowerCase();
  const parts = normalizedHost.split(".");

  // clinicname.nextwave.au -> clinicname
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

export function middleware(request: NextRequest) {
  const tenantSlug = resolveTenantSlug(request.headers.get("host"));
  const requestHeaders = new Headers(request.headers);

  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug);
  } else {
    requestHeaders.delete("x-tenant-slug");
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
