import { createSupabaseServiceClient } from "./supabase";
import { isSupportedAdapter, type Adapter } from "./adapters";

export type DatabaseConnectionProfile = {
  id?: string;
  clientId?: string | null;
  projectId?: string | null;
  adapter: Adapter;
  connectionRef?: string | null;
  config?: Record<string, unknown>;
  isActive?: boolean;
};

export type HealthcheckResult = {
  ok: boolean;
  adapter: Adapter;
  mode: "live" | "config";
  detail: string;
};

function toRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, unknown>;
  }
  return value as Record<string, unknown>;
}

function resolveRef(ref?: string | null) {
  if (!ref) {
    return undefined;
  }

  if (ref.startsWith("env:")) {
    return process.env[ref.slice(4)];
  }

  return process.env[ref] ?? ref;
}

export async function listDatabaseConnections(clientId?: string) {
  const supabase = createSupabaseServiceClient();
  let query = supabase.from("databases").select("*").order("updated_at", { ascending: false });
  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    clientId: item.client_id,
    projectId: item.project_id,
    adapter: item.adapter as Adapter,
    connectionRef: item.connection_ref,
    config: toRecord(item.config),
    isActive: Boolean(item.is_active)
  })) as DatabaseConnectionProfile[];
}

export async function upsertDatabaseConnection(input: DatabaseConnectionProfile) {
  if (!isSupportedAdapter(input.adapter)) {
    throw new Error(`Unsupported adapter: ${input.adapter}`);
  }

  const supabase = createSupabaseServiceClient();
  const payload = {
    id: input.id,
    client_id: input.clientId ?? null,
    project_id: input.projectId ?? null,
    adapter: input.adapter,
    connection_ref: input.connectionRef ?? null,
    config: input.config ?? {},
    is_active: input.isActive ?? true
  };

  const { data, error } = await supabase.from("databases").upsert(payload).select("*").single();
  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    clientId: data.client_id,
    projectId: data.project_id,
    adapter: data.adapter as Adapter,
    connectionRef: data.connection_ref,
    config: toRecord(data.config),
    isActive: Boolean(data.is_active)
  } satisfies DatabaseConnectionProfile;
}

export async function getDatabaseConnectionById(id: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("databases").select("*").eq("id", id).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return null;
  }

  return {
    id: data.id,
    clientId: data.client_id,
    projectId: data.project_id,
    adapter: data.adapter as Adapter,
    connectionRef: data.connection_ref,
    config: toRecord(data.config),
    isActive: Boolean(data.is_active)
  } satisfies DatabaseConnectionProfile;
}

export async function healthcheckDatabaseConnection(input: DatabaseConnectionProfile): Promise<HealthcheckResult> {
  if (!isSupportedAdapter(input.adapter)) {
    throw new Error(`Unsupported adapter: ${input.adapter}`);
  }

  const refValue = resolveRef(input.connectionRef);
  const config = input.config ?? {};

  if (input.adapter === "supabase") {
    const url = String(config.url ?? refValue ?? "");
    const anonKey = String(config.anonKey ?? "");
    if (!url || !anonKey) {
      return { ok: false, adapter: "supabase", mode: "config", detail: "Missing Supabase url or anonKey" };
    }

    try {
      const response = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/settings`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`
        }
      });
      return {
        ok: response.ok,
        adapter: "supabase",
        mode: "live",
        detail: response.ok ? "Supabase auth endpoint reachable" : `Supabase responded ${response.status}`
      };
    } catch (error) {
      return {
        ok: false,
        adapter: "supabase",
        mode: "live",
        detail: error instanceof Error ? error.message : "Supabase request failed"
      };
    }
  }

  if (input.adapter === "postgres") {
    const connectionString = String(config.connectionString ?? refValue ?? "");
    const ok = connectionString.startsWith("postgres://") || connectionString.startsWith("postgresql://");
    return { ok, adapter: "postgres", mode: "config", detail: ok ? "Postgres DSN format valid" : "Invalid Postgres DSN" };
  }

  if (input.adapter === "firebase") {
    const projectId = String(config.projectId ?? "");
    const apiKey = String(config.apiKey ?? "");
    const ok = Boolean(projectId && apiKey);
    return { ok, adapter: "firebase", mode: "config", detail: ok ? "Firebase config looks valid" : "Missing projectId/apiKey" };
  }

  if (input.adapter === "mongodb") {
    const uri = String(config.uri ?? refValue ?? "");
    const ok = uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
    return { ok, adapter: "mongodb", mode: "config", detail: ok ? "Mongo URI format valid" : "Invalid Mongo URI" };
  }

  const redisUrl = String(config.url ?? refValue ?? "");
  const ok = redisUrl.startsWith("redis://") || redisUrl.startsWith("rediss://");
  return { ok, adapter: "redis", mode: "config", detail: ok ? "Redis URL format valid" : "Invalid Redis URL" };
}
