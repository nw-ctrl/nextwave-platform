import { createSupabaseServiceClient } from "@nextwave/database";

type AccessSummary = {
  isPlatformAdmin: boolean;
  modules: string[];
  role: string | null;
};

export async function getClientPortalAccess(input: { userId?: string | null; clientId?: string | null }) {
  if (!input.userId || !input.clientId) {
    return { isPlatformAdmin: false, modules: [], role: null } satisfies AccessSummary;
  }

  const supabase = createSupabaseServiceClient();
  const [platformRolesRes, membershipRes] = await Promise.all([
    supabase
      .from("user_platform_roles")
      .select("role_key, is_active")
      .eq("user_id", input.userId)
      .eq("is_active", true),
    supabase
      .from("user_client_memberships")
      .select("role_key, scope, is_active")
      .eq("user_id", input.userId)
      .eq("client_id", input.clientId)
      .eq("is_active", true)
      .maybeSingle()
  ]);

  if (platformRolesRes.error) {
    throw new Error(platformRolesRes.error.message);
  }

  if (membershipRes.error) {
    throw new Error(membershipRes.error.message);
  }

  const roles = (platformRolesRes.data ?? []).map((item) => item.role_key);
  const isPlatformAdmin = roles.includes("superuser") || roles.includes("admin");

  const membership = membershipRes.data;
  if (!membership) {
    return { isPlatformAdmin, modules: [], role: null } satisfies AccessSummary;
  }

  const rawModules =
    membership.scope && typeof membership.scope === "object" && Array.isArray((membership.scope as { modules?: unknown }).modules)
      ? ((membership.scope as { modules?: unknown[] }).modules ?? []).filter((value): value is string => typeof value === "string")
      : [];

  return {
    isPlatformAdmin,
    modules: rawModules,
    role: membership.role_key
  } satisfies AccessSummary;
}