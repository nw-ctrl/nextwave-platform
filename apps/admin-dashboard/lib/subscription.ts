import Stripe from "stripe";
import { env } from "@nextwave/config";
import { createSupabaseServiceClient } from "@nextwave/database";

type BillingProfileInput = {
  clientId: string;
  mode?: "platform" | "client";
  stripeAccountId?: string;
  stripeCustomerId?: string;
  keyRef?: string;
  webhookSecretRef?: string;
  metadata?: Record<string, unknown>;
};

const stripeCache = new Map<string, Stripe>();

function getStripeClient(secretKey?: string) {
  const key = secretKey ?? env.stripeSecretKey;
  if (!key) {
    return null;
  }

  if (!stripeCache.has(key)) {
    stripeCache.set(key, new Stripe(key));
  }

  return stripeCache.get(key)!;
}

export async function listBillingProfiles(clientId?: string) {
  const supabase = createSupabaseServiceClient();
  let query = supabase.from("billing_profiles").select("*").order("created_at", { ascending: false });
  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function upsertBillingProfile(input: BillingProfileInput) {
  const supabase = createSupabaseServiceClient();
  const payload = {
    client_id: input.clientId,
    provider: "stripe",
    mode: input.mode ?? "platform",
    stripe_account_id: input.stripeAccountId ?? null,
    stripe_customer_id: input.stripeCustomerId ?? null,
    key_ref: input.keyRef ?? null,
    webhook_secret_ref: input.webhookSecretRef ?? null,
    is_active: true,
    metadata: input.metadata ?? {}
  };

  const { data, error } = await supabase
    .from("billing_profiles")
    .upsert(payload, { onConflict: "client_id,provider,mode" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function resolveStripeContext(clientId?: string) {
  if (!clientId) {
    return {
      customerId: null as string | null,
      mode: "platform" as const,
      stripeAccountId: null as string | null
    };
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("billing_profiles")
    .select("stripe_customer_id, mode, stripe_account_id")
    .eq("client_id", clientId)
    .eq("provider", "stripe")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    customerId: data?.stripe_customer_id ?? null,
    mode: (data?.mode as "platform" | "client" | undefined) ?? "platform",
    stripeAccountId: data?.stripe_account_id ?? null
  };
}

export async function getSubscriptionStatus(input: { customerId?: string; clientId?: string; stripeSecretKey?: string }) {
  const client = getStripeClient(input.stripeSecretKey);
  if (!client) {
    return { status: "inactive", source: "missing_stripe_key", mode: "platform" };
  }

  const context = await resolveStripeContext(input.clientId);
  const customerId = input.customerId ?? context.customerId;
  if (!customerId) {
    return { status: "inactive", source: "missing_customer_id", mode: context.mode };
  }

  const requestOptions = context.stripeAccountId ? { stripeAccount: context.stripeAccountId } : undefined;
  const subscriptions = await client.subscriptions.list({ customer: customerId, limit: 1 }, requestOptions);
  const sub = subscriptions.data[0];
  return {
    status: sub?.status ?? "inactive",
    currentPeriodEnd: sub ? new Date(sub.current_period_end * 1000).toISOString() : null,
    mode: context.mode,
    stripeAccountId: context.stripeAccountId
  };
}

export async function enforceSubscriptionAccess(input: {
  customerId?: string;
  clientId?: string;
  stripeSecretKey?: string;
}) {
  const sub = await getSubscriptionStatus(input);
  const allowed = sub.status === "active" || sub.status === "trialing";
  return { allowed, ...sub };
}
