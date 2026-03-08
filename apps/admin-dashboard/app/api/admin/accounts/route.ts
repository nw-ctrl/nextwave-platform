import {
  adminForcePasswordReset,
  adminSetAccountStatus,
  logAdminAudit
} from "../../../../lib/admin";
import { requirePlatformRole } from "../../../../lib/authz";

export async function POST(request: Request) {
  try {
    const actorUserId = await requirePlatformRole(request, ["superuser"]);
    const body = await request.json();

    if (!body.targetUserId || !body.action) {
      return Response.json({ error: "Missing targetUserId or action" }, { status: 400 });
    }

    if (body.action === "block") {
      const account = await adminSetAccountStatus({ targetUserId: body.targetUserId, blocked: true });
      const audit = await logAdminAudit({
        actorUserId,
        actorRole: "superuser",
        action: "account.block",
        targetType: "user",
        targetId: body.targetUserId,
        payload: { accountStatus: account.account_status }
      });
      return Response.json({ ok: true, actorUserId, action: "block", account, auditId: audit.id });
    }

    if (body.action === "unblock") {
      const account = await adminSetAccountStatus({ targetUserId: body.targetUserId, blocked: false });
      const audit = await logAdminAudit({
        actorUserId,
        actorRole: "superuser",
        action: "account.unblock",
        targetType: "user",
        targetId: body.targetUserId,
        payload: { accountStatus: account.account_status }
      });
      return Response.json({ ok: true, actorUserId, action: "unblock", account, auditId: audit.id });
    }

    if (body.action === "delete") {
      const account = await adminSetAccountStatus({ targetUserId: body.targetUserId, deleted: true });
      const audit = await logAdminAudit({
        actorUserId,
        actorRole: "superuser",
        action: "account.delete",
        targetType: "user",
        targetId: body.targetUserId,
        payload: { accountStatus: account.account_status }
      });
      return Response.json({ ok: true, actorUserId, action: "delete", account, auditId: audit.id });
    }

    if (body.action === "reset_password") {
      const result = await adminForcePasswordReset({ targetUserId: body.targetUserId });
      const audit = await logAdminAudit({
        actorUserId,
        actorRole: "superuser",
        action: "account.reset_password",
        targetType: "user",
        targetId: body.targetUserId,
        payload: { mechanism: result.mechanism, resetQueued: result.resetQueued }
      });
      return Response.json({ ok: true, actorUserId, action: "reset_password", result, auditId: audit.id });
    }

    return Response.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "admin_action_failed";
    return Response.json({ ok: false, error: message }, { status: 403 });
  }
}
