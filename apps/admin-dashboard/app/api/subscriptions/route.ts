import { NextResponse } from "next/server";
import { listSubscriptions } from "../../../lib/subscription";
import { requirePlatformRole } from "../../../lib/authz";

export async function GET(request: Request) {
  try {
    await requirePlatformRole(request, ["superuser"]);
    const items = await listSubscriptions();
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch subscriptions failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
