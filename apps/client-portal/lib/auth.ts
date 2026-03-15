import { cookies } from "next/headers";
import { createSupabaseAnonClient, createSupabaseServiceClient } from "@nextwave/database";

export const PORTAL_ACCESS_COOKIE = "nw_portal_access_token";
export const PORTAL_REFRESH_COOKIE = "nw_portal_refresh_token";
export const PORTAL_CLIENT_COOKIE = "nw_portal_client_id";

export type PortalMembership = {
  clientId: string;
  clinicName: string;
  role: string;
  modules: string[];
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
  } | null;
};

export type PortalSession = {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    accountStatus: string;
  };
  memberships: PortalMembership[];
  selectedClientId: string | null;
};

type MembershipRow = {
  client_id: string;
  role_key: string;
  scope: unknown;
  clients: {
    name?: string | null;
    subscriptions?: {
      plan: string;
      status: string;
      current_period_end: string | null;
    }[];
  } | {
    name?: string | null;
    subscriptions?: {
      plan: string;
      status: string;
      current_period_end: string | null;
    }[];
  }[] | null;
};

function readModules(scope: unknown) {
  if (!scope || typeof scope !== "object" || !Array.isArray((scope as { modules?: unknown }).modules)) {
    return [] as string[];
  }

  return ((scope as { modules?: unknown[] }).modules ?? []).filter((item): item is string => typeof item === "string");
}

function readClinicName(clients: MembershipRow["clients"]) {
  const record = Array.isArray(clients) ? clients[0] : clients;
  return typeof record?.name === "string" && record.name.trim() ? record.name : "Clinic";
}

function readSubscription(clients: MembershipRow["clients"]) {
  const record = Array.isArray(clients) ? clients[0] : clients;
  const sub = record?.subscriptions?.[0];
  if (!sub) return null;
  return {
    plan: sub.plan,
    status: sub.status,
    currentPeriodEnd: sub.current_period_end
  };
}

export async function listPortalMemberships(userId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("user_client_memberships")
    .select("client_id, role_key, scope, clients(name, subscriptions(plan, status, current_period_end))")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as MembershipRow[]).map((item) => ({
    clientId: item.client_id,
    clinicName: readClinicName(item.clients),
    role: item.role_key,
    modules: readModules(item.scope),
    subscription: readSubscription(item.clients)
  })) satisfies PortalMembership[];
}

export async function getPortalSession(): Promise<PortalSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(PORTAL_ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const anon = createSupabaseAnonClient();
  const {
    data: { user: authUser },
    error: authError
  } = await anon.auth.getUser(accessToken);

  if (authError || !authUser) {
    return null;
  }

  const supabase = createSupabaseServiceClient();
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, full_name, account_status")
    .eq("id", authUser.id)
    .maybeSingle<{ id: string; email: string; full_name: string | null; account_status: string }>();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user || user.account_status !== "active") {
    return null;
  }

  const memberships = await listPortalMemberships(user.id);
  const selectedClientId = cookieStore.get(PORTAL_CLIENT_COOKIE)?.value ?? null;
  const resolvedSelectedClientId = memberships.some((item) => item.clientId === selectedClientId)
    ? selectedClientId
    : memberships[0]?.clientId ?? null;

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      accountStatus: user.account_status
    },
    memberships,
    selectedClientId: resolvedSelectedClientId
  } satisfies PortalSession;
}

export async function requirePortalContext(options?: { allowedRoles?: string[]; moduleKey?: string }) {
  const session = await getPortalSession();
  if (!session) {
    throw new Error("Unauthenticated");
  }

  if (!session.selectedClientId) {
    throw new Error("No clinic selected");
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId);
  if (!membership) {
    throw new Error("No clinic membership found");
  }

  if (options?.allowedRoles && !options.allowedRoles.includes(membership.role)) {
    throw new Error(`Clinic role required: ${options.allowedRoles.join(", ")}`);
  }

  if (options?.moduleKey && membership.modules.length > 0 && !membership.modules.includes(options.moduleKey)) {
    throw new Error(`Module access denied: ${options.moduleKey}`);
  }

  return {
    session,
    membership,
    clientId: membership.clientId,
    userId: session.user.id
  };
}
