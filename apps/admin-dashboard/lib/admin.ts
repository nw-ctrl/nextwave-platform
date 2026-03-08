import { createSupabaseServiceClient } from "@nextwave/database";

export async function logAdminAudit(input: {
  actorUserId: string;
  actorRole: "superuser" | "admin";
  action: string;
  targetType: string;
  targetId?: string;
  status?: "success" | "failed";
  payload?: Record<string, unknown>;
}) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      actor_user_id: input.actorUserId,
      actor_role: input.actorRole,
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId ?? null,
      status: input.status ?? "success",
      payload: input.payload ?? {}
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function adminSetAccountStatus(input: {
  targetUserId: string;
  blocked?: boolean;
  deleted?: boolean;
}) {
  const supabase = createSupabaseServiceClient();

  if (input.deleted) {
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(input.targetUserId);
    if (deleteAuthError) {
      throw new Error(deleteAuthError.message);
    }
  } else {
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(input.targetUserId, {
      ban_duration: input.blocked ? "876000h" : "none"
    });

    if (authUpdateError) {
      throw new Error(authUpdateError.message);
    }
  }

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

  const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: user.email
  });

  if (resetError) {
    throw new Error(resetError.message);
  }

  return {
    userId: user.id,
    email: user.email,
    resetQueued: true,
    mechanism: "supabase-auth-admin-generate-link",
    resetLink: resetData.properties?.action_link ?? null
  };
}

export async function adminCreateUserAccount(input: {
  email: string;
  password?: string;
  fullName?: string;
  emailConfirm?: boolean;
}) {
  const supabase = createSupabaseServiceClient();

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: input.emailConfirm ?? true,
    user_metadata: {
      full_name: input.fullName ?? null
    }
  });

  if (createError || !created.user) {
    throw new Error(createError?.message ?? "Failed to create auth user");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .upsert(
      {
        id: created.user.id,
        email: created.user.email ?? input.email,
        full_name: input.fullName ?? null,
        account_status: "active"
      },
      { onConflict: "id" }
    )
    .select("id, email, full_name, account_status")
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return {
    authUserId: created.user.id,
    email: created.user.email ?? input.email,
    profile
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
