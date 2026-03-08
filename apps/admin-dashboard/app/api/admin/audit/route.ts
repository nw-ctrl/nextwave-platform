import { createSupabaseServiceClient } from "@nextwave/database";
import { requirePlatformRole } from "../../../../lib/authz";

export async function GET(request: Request) {
  try {
    const actorUserId = await requirePlatformRole(request, ["superuser"]);
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const targetType = url.searchParams.get("targetType");
    const limit = Number(url.searchParams.get("limit") ?? "50");

    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 200));

    if (action) {
      query = query.eq("action", action);
    }

    if (targetType) {
      query = query.eq("target_type", targetType);
    }

    const { data, error } = await query;
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true, actorUserId, items: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "audit_read_failed";
    return Response.json({ ok: false, error: message }, { status: 403 });
  }
}