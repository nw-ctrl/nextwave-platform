import { createClient } from "@supabase/supabase-js";
import { env } from "@nextwave/config";

function assertSupabaseConfig() {
  if (!env.supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
}

export function createSupabaseAnonClient() {
  assertSupabaseConfig();

  if (!env.supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}

export function createSupabaseServiceClient() {
  assertSupabaseConfig();

  if (!env.supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
