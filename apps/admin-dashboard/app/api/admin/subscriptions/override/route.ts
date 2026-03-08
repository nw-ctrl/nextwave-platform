import { adminOverrideSubscription, logAdminAudit } from "../../../../../lib/admin";
import { requirePlatformRole } from "../../../../../lib/authz";

export async function POST(request: Request) {
  try {
    const actorUserId = await requirePlatformRole(request, ["superuser"]);
    const body = await request.json();

    if (!body.clientId || !body.status) {
      return Response.json({ error: "Missing clientId or status" }, { status: 400 });
    }

    const subscription = await adminOverrideSubscription({
      clientId: body.clientId,
      status: body.status,
      plan: body.plan,
      reason: body.reason
    });

    const audit = await logAdminAudit({
      actorUserId,
      actorRole: "superuser",
      action: "subscription.override",
      targetType: "client",
      targetId: body.clientId,
      payload: {
        status: body.status,
        plan: body.plan ?? "manual-override",
        reason: body.reason ?? "admin_override"
      }
    });

    return Response.json({ ok: true, actorUserId, subscription, auditId: audit.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "subscription_override_failed";
    return Response.json({ ok: false, error: message }, { status: 403 });
  }
}
