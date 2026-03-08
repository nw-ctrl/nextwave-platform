import { createSupabaseServiceClient } from "@nextwave/database";
import { getEffectiveAccess } from "./access";

export async function requireSuperuser(request: Request) {
  const actorUserId = request.headers.get("x-actor-user-id") ?? new URL(request.url).searchParams.get("actorUserId");
  if (!actorUserId) {
    throw new Error("Missing actor user id. Provide x-actor-user-id header or actorUserId query param.");
  }

  const access = await getEffectiveAccess(actorUserId);
  if (!access.platform.isSuperuser) {
    throw new Error("Superuser role required");
  }

  return actorUserId;
}

export async function adminSetAccountStatus(input: {
  targetUserId: string;
  blocked?: boolean;
  deleted?: boolean;
}) {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("users")
    .update({
      account_status: input.deleted ? "deleted" : input.blocked ? "blocked" : "active"
    })
    .eq("id", input.targetUserId)
    .select("id, email, account_status")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function adminForcePasswordReset(input: { targetUserId: string }) {
  const supabase = createSupabaseServiceClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email")
    .eq("id", input.targetUserId)
    .single();

  if (userError) {
    throw new Error(userError.message);
  }

  // Placeholder operation for now. A production implementation should call Supabase auth admin API.
  return {
    userId: user.id,
    email: user.email,
    resetQueued: true,
    mechanism: "supabase-auth-admin-todo"
  };
}

export async function adminOverrideSubscription(input: {
  clientId: string;
  status: string;
  plan?: string;
  reason?: string;
}) {
  const supabase = createSupabaseServiceClient();

  const { data: existing, error: existingError } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("client_id", input.clientId)
    .eq("provider", "stripe")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const payload = {
    client_id: input.clientId,
    provider: "stripe",
    external_id: null,
    plan: input.plan ?? "manual-override",
    status: input.status,
    current_period_start: new Date().toISOString(),
    current_period_end: null,
    metadata: {
      overrideReason: input.reason ?? "admin_override"
    }
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("subscriptions")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  const { data, error } = await supabase.from("subscriptions").insert(payload).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}