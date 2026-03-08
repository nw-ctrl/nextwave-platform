import {
  adminForcePasswordReset,
  adminSetAccountStatus
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
      return Response.json({ ok: true, actorUserId, action: "block", account });
    }

    if (body.action === "unblock") {
      const account = await adminSetAccountStatus({ targetUserId: body.targetUserId, blocked: false });
      return Response.json({ ok: true, actorUserId, action: "unblock", account });
    }

    if (body.action === "delete") {
      const account = await adminSetAccountStatus({ targetUserId: body.targetUserId, deleted: true });
      return Response.json({ ok: true, actorUserId, action: "delete", account });
    }

    if (body.action === "reset_password") {
      const result = await adminForcePasswordReset({ targetUserId: body.targetUserId });
      return Response.json({ ok: true, actorUserId, action: "reset_password", result });
    }

    return Response.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "admin_action_failed";
    return Response.json({ ok: false, error: message }, { status: 403 });
  }
}
