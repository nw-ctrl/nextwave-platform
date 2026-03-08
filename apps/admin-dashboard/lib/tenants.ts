import { createSupabaseServiceClient } from "@nextwave/database";

export async function listTenantBranding(clientId?: string, appId?: string) {
  const supabase = createSupabaseServiceClient();
  let query = supabase.from("tenant_branding").select("*").order("updated_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  if (appId) {
    query = query.eq("app_id", appId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function upsertTenantBranding(input: {
  clientId: string;
  appId?: string;
  brandName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  locale?: string;
  timezone?: string;
  domain?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseServiceClient();

  const payload = {
    client_id: input.clientId,
    app_id: input.appId ?? "default",
    brand_name: input.brandName,
    logo_url: input.logoUrl ?? null,
    favicon_url: input.faviconUrl ?? null,
    primary_color: input.primaryColor ?? null,
    secondary_color: input.secondaryColor ?? null,
    accent_color: input.accentColor ?? null,
    locale: input.locale ?? "en-AU",
    timezone: input.timezone ?? null,
    domain: input.domain ?? null,
    metadata: input.metadata ?? {}
  };

  const { data, error } = await supabase
    .from("tenant_branding")
    .upsert(payload, { onConflict: "client_id,app_id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listTenantFeatures(clientId?: string, appId?: string) {
  const supabase = createSupabaseServiceClient();
  let query = supabase.from("tenant_features").select("*").order("updated_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  if (appId) {
    query = query.eq("app_id", appId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function upsertTenantFeature(input: {
  clientId: string;
  appId?: string;
  featureKey: string;
  isEnabled?: boolean;
  rollout?: string;
  config?: Record<string, unknown>;
}) {
  const supabase = createSupabaseServiceClient();

  const payload = {
    client_id: input.clientId,
    app_id: input.appId ?? "default",
    feature_key: input.featureKey,
    is_enabled: input.isEnabled ?? true,
    rollout: input.rollout ?? "general",
    config: input.config ?? {}
  };

  const { data, error } = await supabase
    .from("tenant_features")
    .upsert(payload, { onConflict: "client_id,app_id,feature_key" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getTenantBootstrap(input: { clientId: string; appId?: string }) {
  const appId = input.appId ?? "default";
  const supabase = createSupabaseServiceClient();

  const [brandingRes, featuresRes] = await Promise.all([
    supabase
      .from("tenant_branding")
      .select("*")
      .eq("client_id", input.clientId)
      .eq("app_id", appId)
      .maybeSingle(),
    supabase
      .from("tenant_features")
      .select("feature_key, is_enabled, config, rollout")
      .eq("client_id", input.clientId)
      .eq("app_id", appId)
  ]);

  if (brandingRes.error) {
    throw new Error(brandingRes.error.message);
  }

  if (featuresRes.error) {
    throw new Error(featuresRes.error.message);
  }

  return {
    clientId: input.clientId,
    appId,
    branding: brandingRes.data ?? null,
    features: featuresRes.data ?? []
  };
}