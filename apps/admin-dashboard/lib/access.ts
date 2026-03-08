import { createSupabaseServiceClient } from "@nextwave/database";

export async function listPlatformRoles(userId?: string) {
  const supabase = createSupabaseServiceClient();
  let query = supabase.from("user_platform_roles").select("*").order("updated_at", { ascending: false });
  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function upsertPlatformRole(input: {
  userId: string;
  roleKey: "superuser" | "admin" | "auditor";
  isActive?: boolean;
}) {
  const supabase = createSupabaseServiceClient();
  const payload = {
    user_id: input.userId,
    role_key: input.roleKey,
    is_active: input.isActive ?? true
  };

  const { data, error } = await supabase
    .from("user_platform_roles")
    .upsert(payload, { onConflict: "user_id,role_key" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listClientMemberships(userId?: string, clientId?: string) {
  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("user_client_memberships")
    .select("*")
    .order("updated_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function upsertClientMembership(input: {
  userId: string;
  clientId: string;
  roleKey: "admin" | "manager" | "staff" | "viewer";
  scope?: Record<string, unknown>;
  isActive?: boolean;
}) {
  const supabase = createSupabaseServiceClient();
  const payload = {
    user_id: input.userId,
    client_id: input.clientId,
    role_key: input.roleKey,
    scope: input.scope ?? {},
    is_active: input.isActive ?? true
  };

  const { data, error } = await supabase
    .from("user_client_memberships")
    .upsert(payload, { onConflict: "user_id,client_id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getEffectiveAccess(userId: string) {
  const [platformRoles, memberships] = await Promise.all([
    listPlatformRoles(userId),
    listClientMemberships(userId)
  ]);

  const activePlatformRoles = platformRoles.filter((item) => item.is_active).map((item) => item.role_key);
  const isSuperuser = activePlatformRoles.includes("superuser");

  return {
    userId,
    platform: {
      roles: activePlatformRoles,
      isSuperuser,
      isAdmin: isSuperuser || activePlatformRoles.includes("admin")
    },
    clients: memberships
      .filter((item) => item.is_active)
      .map((item) => ({
        clientId: item.client_id,
        role: item.role_key,
        scope: item.scope
      }))
  };
}