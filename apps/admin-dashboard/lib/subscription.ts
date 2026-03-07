import Stripe from "stripe";
import { env } from "@nextwave/config";
import { createSupabaseServiceClient } from "@nextwave/database";
import { resolveSecretValue } from "./secrets";

type BillingProfileInput = {
  clientId: string;
  mode?: "platform" | "client";
  stripeAccountId?: string;
  stripeCustomerId?: string;
  keyRef?: string;
  webhookSecretRef?: string;
  metadata?: Record<string, unknown>;
};

type StripeWebhookCandidate = {
  source: string;
  secret: string;
  stripeKey?: string;
  stripeAccountId?: string | null;
};

type BillingProfileRow = {
  client_id: string;
  mode: "platform" | "client";
  stripe_account_id: string | null;
  stripe_customer_id: string | null;
  key_ref: string | null;
  webhook_secret_ref: string | null;
};

type StripeWebhookContext = {
  stripeKey?: string;
  stripeAccountId?: string | null;
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

async function getLatestBillingProfile(clientId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("billing_profiles")
    .select("client_id, mode, stripe_account_id, stripe_customer_id, key_ref, webhook_secret_ref")
    .eq("client_id", clientId)
    .eq("provider", "stripe")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<BillingProfileRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function findClientIdByCustomerId(customerId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("billing_profiles")
    .select("client_id")
    .eq("provider", "stripe")
    .eq("stripe_customer_id", customerId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ client_id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return data?.client_id ?? null;
}

function normalizeEpoch(epoch?: number | null) {
  if (!epoch) {
    return null;
  }
  return new Date(epoch * 1000).toISOString();
}

async function upsertSubscriptionRecord(params: {
  clientId: string;
  stripeSubscription: Stripe.Subscription;
}) {
  const supabase = createSupabaseServiceClient();
  const sub = params.stripeSubscription;
  const plan = sub.items.data[0]?.price?.id ?? "stripe-default";

  const payload = {
    client_id: params.clientId,
    provider: "stripe",
    external_id: sub.id,
    plan,
    status: sub.status,
    current_period_start: normalizeEpoch(sub.current_period_start),
    current_period_end: normalizeEpoch(sub.current_period_end)
  };

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(payload, { onConflict: "external_id" })
    .select("id, external_id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function upsertReceipt(params: {
  subscriptionId: string;
  invoice: Stripe.Invoice;
}) {
  const supabase = createSupabaseServiceClient();
  const invoice = params.invoice;
  const currency = (invoice.currency ?? "usd").toLowerCase();

  const payload = {
    subscription_id: params.subscriptionId,
    amount_cents: invoice.amount_paid,
    currency,
    provider_receipt_id: invoice.id,
    paid_at: invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : null
  };

  const { error } = await supabase
    .from("receipts")
    .upsert(payload, { onConflict: "provider_receipt_id" });

  if (error) {
    throw new Error(error.message);
  }
}

async function resolveClientIdFromSubscription(sub: Stripe.Subscription) {
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (customer) {
    const byCustomer = await findClientIdByCustomerId(customer);
    if (byCustomer) {
      return byCustomer;
    }
  }

  const metaClientId = sub.metadata?.clientId ?? sub.metadata?.client_id;
  return metaClientId ?? null;
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
      stripeAccountId: null as string | null,
      stripeKey: env.stripeSecretKey || undefined
    };
  }

  const profile = await getLatestBillingProfile(clientId);
  return {
    customerId: profile?.stripe_customer_id ?? null,
    mode: profile?.mode ?? "platform",
    stripeAccountId: profile?.stripe_account_id ?? null,
    stripeKey: (resolveSecretValue(profile?.key_ref) ?? env.stripeSecretKey) || undefined
  };
}

export async function getSubscriptionStatus(input: { customerId?: string; clientId?: string; stripeSecretKey?: string }) {
  const context = await resolveStripeContext(input.clientId);
  const client = getStripeClient(input.stripeSecretKey ?? context.stripeKey);
  if (!client) {
    return { status: "inactive", source: "missing_stripe_key", mode: context.mode };
  }

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

export async function listStripeWebhookCandidates() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("billing_profiles")
    .select("client_id, key_ref, webhook_secret_ref, stripe_account_id")
    .eq("provider", "stripe")
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  const candidates: StripeWebhookCandidate[] = [];

  if (env.stripeWebhookSecret) {
    candidates.push({
      source: "env.STRIPE_WEBHOOK_SECRET",
      secret: env.stripeWebhookSecret,
      stripeKey: env.stripeSecretKey || undefined,
      stripeAccountId: null
    });
  }

  for (const row of (data ?? []) as Array<{
    client_id: string;
    key_ref: string | null;
    webhook_secret_ref: string | null;
    stripe_account_id: string | null;
  }>) {
    const webhookSecret = resolveSecretValue(row.webhook_secret_ref);
    if (!webhookSecret) {
      continue;
    }

    candidates.push({
      source: `billing_profile:${row.client_id}`,
      secret: webhookSecret,
      stripeKey: (resolveSecretValue(row.key_ref) ?? env.stripeSecretKey) || undefined,
      stripeAccountId: row.stripe_account_id
    });
  }

  return candidates;
}

export async function verifyStripeWebhookEvent(payload: string, signature: string | null) {
  if (!signature) {
    return { ok: false as const, reason: "missing_signature" };
  }

  const candidates = await listStripeWebhookCandidates();
  if (candidates.length === 0) {
    return { ok: false as const, reason: "no_webhook_secret_candidates" };
  }

  const verifierKey = env.stripeSecretKey ?? candidates.find((candidate) => candidate.stripeKey)?.stripeKey;
  if (!verifierKey) {
    return { ok: false as const, reason: "missing_stripe_key_for_verifier" };
  }

  const verifier = new Stripe(verifierKey);

  for (const candidate of candidates) {
    try {
      const event = verifier.webhooks.constructEvent(payload, signature, candidate.secret);
      return {
        ok: true as const,
        event,
        context: {
          stripeKey: candidate.stripeKey,
          stripeAccountId: candidate.stripeAccountId
        } satisfies StripeWebhookContext,
        source: candidate.source
      };
    } catch {
      // try next candidate
    }
  }

  return { ok: false as const, reason: "signature_verification_failed" };
}

export async function processStripeWebhookEvent(event: Stripe.Event, context: StripeWebhookContext) {
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const clientId = await resolveClientIdFromSubscription(sub);
    if (!clientId) {
      return { handled: false, reason: "no_client_mapping_for_subscription" };
    }

    const upserted = await upsertSubscriptionRecord({ clientId, stripeSubscription: sub });
    return { handled: true, type: event.type, subscriptionId: upserted.id };
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
    const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

    if (!subscriptionId) {
      return { handled: false, reason: "invoice_without_subscription" };
    }

    let stripeSubscription: Stripe.Subscription | null = null;
    const client = getStripeClient(context.stripeKey);
    if (client) {
      const requestOptions = context.stripeAccountId ? { stripeAccount: context.stripeAccountId } : undefined;
      stripeSubscription = await client.subscriptions.retrieve(subscriptionId, {}, requestOptions);
    }

    const resolvedClientId = stripeSubscription
      ? await resolveClientIdFromSubscription(stripeSubscription)
      : customerId
        ? await findClientIdByCustomerId(customerId)
        : null;

    if (!resolvedClientId) {
      return { handled: false, reason: "no_client_mapping_for_invoice" };
    }

    const upsertedSub = stripeSubscription
      ? await upsertSubscriptionRecord({ clientId: resolvedClientId, stripeSubscription })
      : null;

    if (upsertedSub) {
      await upsertReceipt({ subscriptionId: upsertedSub.id, invoice });
      return { handled: true, type: event.type, subscriptionId: upsertedSub.id };
    }

    return { handled: false, reason: "subscription_not_retrieved" };
  }

  return { handled: true, type: event.type, skipped: true };
}
