import { NextResponse } from "next/server";
import { getClinicUsage } from "../../../../lib/usage";
import { requirePlatformRole } from "../../../../lib/authz";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const actorUserId = request.headers.get("x-actor-user-id");
    if (!actorUserId) {
      return NextResponse.json({ error: "x-actor-user-id header required" }, { status: 401 });
    }

    // Ensure only superusers can access this
    await requirePlatformRole(request, ["superuser"]);

    const { clientId } = await params;
    const usage = await getClinicUsage(clientId);

    return NextResponse.json(usage);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Usage fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
