import Stripe from "stripe";
import { env } from "@nextwave/config";
import { createSupabaseServiceClient } from "@nextwave/database";
import { getClientPortalAccess } from "./access";

type BillingProfileRow = {
  client_id: string;
  mode: "platform" | "client";
  stripe_account_id: string | null;
  stripe_customer_id: string | null;
  key_ref: string | null;
  webhook_secret_ref: string | null;
};

function resolveSecretValue(ref?: string | null) {
  if (!ref) {
    return undefined;
  }

  if (ref.startsWith("env:")) {
    return process.env[ref.slice(4)];
  }

  return process.env[ref] ?? undefined;
}

function getStripeClient(secretKey?: string) {
  const key = secretKey ?? env.stripeSecretKey;
  if (!key) {
    return null;
  }

  return new Stripe(key);
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

async function getClientRecord(clientId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("clients").select("id, name").eq("id", clientId).maybeSingle<{ id: string; name: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function upsertBillingProfile(input: {
  clientId: string;
  stripeCustomerId?: string | null;
  stripeAccountId?: string | null;
  keyRef?: string | null;
  webhookSecretRef?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseServiceClient();
  const payload = {
    client_id: input.clientId,
    provider: "stripe",
    mode: "client",
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

async function ensureStripeCustomerForClient(input: {
  clientId: string;
  customerEmail?: string;
  profile?: BillingProfileRow | null;
}) {
  const stripeKey = (resolveSecretValue(input.profile?.key_ref) ?? env.stripeSecretKey) || undefined;
  const client = getStripeClient(stripeKey);
  if (!client) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  const existingCustomerId = input.profile?.stripe_customer_id?.trim();
  if (existingCustomerId) {
    try {
      await client.customers.retrieve(existingCustomerId);
      return existingCustomerId;
    } catch {
      await upsertBillingProfile({
        clientId: input.clientId,
        stripeCustomerId: null,
        stripeAccountId: input.profile?.stripe_account_id ?? null,
        keyRef: input.profile?.key_ref ?? (env.stripeSecretKey ? "env:STRIPE_SECRET_KEY" : null),
        webhookSecretRef: input.profile?.webhook_secret_ref ?? (env.stripeWebhookSecret ? "env:STRIPE_WEBHOOK_SECRET" : null),
        metadata: {
          source: "client-portal-billing",
          customerResetAt: new Date().toISOString()
        }
      });
    }
  }

  const clientRecord = await getClientRecord(input.clientId);
  const customer = await client.customers.create({
    email: input.customerEmail,
    name: clientRecord?.name ?? `Clinic ${input.clientId}`,
    metadata: {
      clientId: input.clientId,
      appId: "medivault",
      source: "client-portal-billing"
    }
  });

  await upsertBillingProfile({
    clientId: input.clientId,
    stripeCustomerId: customer.id,
    stripeAccountId: input.profile?.stripe_account_id ?? null,
    keyRef: input.profile?.key_ref ?? (env.stripeSecretKey ? "env:STRIPE_SECRET_KEY" : null),
    webhookSecretRef: input.profile?.webhook_secret_ref ?? (env.stripeWebhookSecret ? "env:STRIPE_WEBHOOK_SECRET" : null),
    metadata: {
      source: "client-portal-billing",
      appId: "medivault"
    }
  });

  return customer.id;
}

export async function createClinicPortalCheckoutSession(input: {
  clientId: string;
  userId: string;
  origin: string;
  customerEmail?: string;
  priceId?: string;
}) {
  const access = await getClientPortalAccess({ userId: input.userId, clientId: input.clientId });
  const roleAllowed = access.role === "admin" || access.role === "manager";
  const moduleAllowed = access.isPlatformAdmin || access.modules.length === 0 || access.modules.includes("billing");

  if (!roleAllowed && !access.isPlatformAdmin) {
    throw new Error("Billing access requires clinic admin or manager role");
  }

  if (!moduleAllowed) {
    throw new Error("Billing module access is not enabled for this user");
  }

   // Ensure we have a valid priceId passed from the route
  const priceId = input.priceId;
  if (!priceId) {
    throw new Error("Missing Stripe Price ID for checkout session. Please check Vercel environment variables.");
  }


  const profile = await getLatestBillingProfile(input.clientId);
  const stripeKey = (resolveSecretValue(profile?.key_ref) ?? env.stripeSecretKey) || undefined;
  const client = getStripeClient(stripeKey);
  if (!client) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  const customerId = await ensureStripeCustomerForClient({
    clientId: input.clientId,
    customerEmail: input.customerEmail,
    profile
  });

  const requestOptions = profile?.stripe_account_id ? { stripeAccount: profile.stripe_account_id } : undefined;
  const session = await client.checkout.sessions.create(
    {
      mode: "subscription",
      customer: customerId,
      client_reference_id: input.clientId,
      success_url: `${input.origin}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.origin}/billing?checkout=cancel`,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        clientId: input.clientId,
        userId: input.userId,
        appId: "medivault",
        flow: "client-portal-checkout"
      },
      subscription_data: {
        metadata: {
          clientId: input.clientId,
          userId: input.userId,
          appId: "medivault",
          flow: "client-portal-checkout"
        }
      }
    },
    requestOptions
  );

  return {
    sessionId: session.id,
    url: session.url,
    customerId
  };
}

// -------------------------------------------------------------------
// USAGE & RECOMMENDATION ENGINE
// -------------------------------------------------------------------

export async function getClinicUsage(clientId: string) {
  const supabase = createSupabaseServiceClient();

  const [patientsResult, visitsResult] = await Promise.all([
    supabase.from("patients").select("id", { count: "estimated", head: true }).eq("clinic_id", clientId).eq("is_deleted", false),
    supabase.from("visits").select("id", { count: "estimated", head: true }).eq("clinic_id", clientId).eq("is_deleted", false)
  ]);

  const visitReportsBucket = supabase.storage.from("visit-reports");
  let totalStorageBytes = 0;

  try {
    const { data: patientFolders, error: listError } = await visitReportsBucket.list(clientId);
    if (!listError && patientFolders) {
      const patientScans = await Promise.all(
          patientFolders.map(folder => visitReportsBucket.list(`${clientId}/${folder.name}`))
      );

      patientScans.forEach(({ data }) => {
          data?.forEach(file => {
              totalStorageBytes += (file.metadata?.size ?? 0);
          });
      });
    }
  } catch (e) {
    // Ignore errors for storage scan missing footprint
  }

  return {
    clientId,
    patientCount: patientsResult.count ?? 0,
    visitCount: visitsResult.count ?? 0,
    storageBytes: totalStorageBytes,
  };
}

export async function getTierRecommendation(clientId: string) {
  const usage = await getClinicUsage(clientId);

  let recommendedPlan: "basic" | "standard" | "premium" = "basic";
  const reasons: string[] = [];

  const STANDARD_STORAGE_THRESHOLD = 0; 
  const STANDARD_VISIT_THRESHOLD = 100;
  const PREMIUM_STORAGE_THRESHOLD = 500 * 1024 * 1024; // > 500MB
  const PREMIUM_VISIT_THRESHOLD = 1000;

  if (usage.storageBytes > PREMIUM_STORAGE_THRESHOLD || usage.visitCount > PREMIUM_VISIT_THRESHOLD) {
    recommendedPlan = "premium";
    if (usage.storageBytes > PREMIUM_STORAGE_THRESHOLD) reasons.push("high storage utilization");
    if (usage.visitCount > PREMIUM_VISIT_THRESHOLD) reasons.push("high patient volume");
  } else if (usage.storageBytes > STANDARD_STORAGE_THRESHOLD || usage.visitCount > STANDARD_VISIT_THRESHOLD) {
    recommendedPlan = "standard";
    if (usage.storageBytes > STANDARD_STORAGE_THRESHOLD) reasons.push("requires secure record storage");
    if (usage.visitCount > STANDARD_VISIT_THRESHOLD) reasons.push("growing clinical practice");
  } else {
    reasons.push("simple platform access fits current needs");
  }

  return {
    clientId,
    recommendedPlan,
    reasons,
    metrics: usage
  };
}
