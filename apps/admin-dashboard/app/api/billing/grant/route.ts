import { NextResponse } from "next/server";
import { grantManualAccess } from "../../../../lib/subscription";
import { requirePlatformRole } from "../../../../lib/authz";

export async function POST(request: Request) {
  try {
    // Ensure only superusers can grant manual access
    await requirePlatformRole(request, ["superuser"]);
    
    const body = await request.json();
    const { clientId, plan, durationDays, reason } = body;

    if (!clientId || !plan || !durationDays) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subscription = await grantManualAccess({
      clientId,
      plan,
      durationDays: parseInt(durationDays),
      metadata: { reason }
    });

    return NextResponse.json(subscription);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Access grant failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
