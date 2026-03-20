import Stripe from "stripe";
import { env } from "@nextwave/config";
import { createSupabaseServiceClient } from "@nextwave/database";

type BillingProfileRow = {
  client_id: string;
  stripe_account_id: string | null;
  stripe_customer_id: string | null;
  key_ref: string | null;
};

export type ClinicBillingInvoice = {
  id: string;
  date: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  hostedInvoiceUrl: string | null;
  pdfUrl: string | null;
};

export type ClinicBillingSummary = {
  customerId: string | null;
  subscriptionId: string | null;
  status: string;
  planKey: "basic" | "standard" | "premium" | "custom" | "unknown";
  planName: string;
  price: number | null;
  currency: string;
  interval: string | null;
  nextBillingDate: string | null;
  cancelAtPeriodEnd: boolean;
  priceId: string | null;
  productId: string | null;
  productName: string | null;
  trialEndsAt: string | null;
  invoices: ClinicBillingInvoice[];
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
    .select("client_id, stripe_account_id, stripe_customer_id, key_ref")
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

function toIsoFromEpoch(epoch?: number | null) {
  if (!epoch) {
    return null;
  }

  return new Date(epoch * 1000).toISOString();
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizePlanKey(input?: string | null): ClinicBillingSummary["planKey"] {
  const value = input?.trim().toLowerCase() ?? "";
  if (!value) {
    return "unknown";
  }
  if (value.includes("premium")) {
    return "premium";
  }
  if (value.includes("standard")) {
    return "standard";
  }
  if (value.includes("basic")) {
    return "basic";
  }
  if (value.includes("custom")) {
    return "custom";
  }
  return "unknown";
}

function inferPlanName(input: {
  lookupKey?: string | null;
  nickname?: string | null;
  productName?: string | null;
  priceId?: string | null;
}) {
  const sources = [input.lookupKey, input.nickname, input.productName];

  for (const source of sources) {
    const normalized = normalizePlanKey(source);
    if (normalized !== "unknown") {
      return {
        planKey: normalized,
        planName: normalized === "custom" ? "Custom Plan" : `${titleCase(normalized)} Plan`
      };
    }
  }

  if (input.productName?.trim()) {
    return { planKey: "custom" as const, planName: input.productName.trim() };
  }

  if (input.nickname?.trim()) {
    return { planKey: "custom" as const, planName: input.nickname.trim() };
  }

  if (input.priceId?.trim()) {
    return { planKey: "unknown" as const, planName: input.priceId.trim() };
  }

  return { planKey: "unknown" as const, planName: "Subscription" };
}

function deriveInvoicePlanName(invoice: Stripe.Invoice, fallback: string) {
  const description = invoice.lines.data.find((item) => item.description)?.description ?? invoice.description ?? "";
  const normalized = normalizePlanKey(description);

  if (normalized !== "unknown") {
    return normalized === "custom" ? "Custom Plan" : `${titleCase(normalized)} Plan`;
  }

  return fallback;
}

export async function getClinicBillingSummary(clientId: string): Promise<ClinicBillingSummary | null> {
  const profile = await getLatestBillingProfile(clientId);
  const stripeKey = (resolveSecretValue(profile?.key_ref) ?? env.stripeSecretKey) || undefined;
  const client = getStripeClient(stripeKey);
  const customerId = profile?.stripe_customer_id?.trim() ?? null;

  if (!client || !customerId) {
    return null;
  }

  const requestOptions = profile?.stripe_account_id ? { stripeAccount: profile.stripe_account_id } : undefined;
  const subscriptions = await client.subscriptions.list(
    {
      customer: customerId,
      status: "all",
      limit: 10,
      expand: ["data.items.data.price.product"]
    },
    requestOptions
  );

  const subscription =
    subscriptions.data.find((item) => ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(item.status)) ??
    subscriptions.data[0];

  if (!subscription) {
    return {
      customerId,
      subscriptionId: null,
      status: "inactive",
      planKey: "unknown",
      planName: "No active plan",
      price: null,
      currency: "PKR",
      interval: null,
      nextBillingDate: null,
      cancelAtPeriodEnd: false,
      priceId: null,
      productId: null,
      productName: null,
      trialEndsAt: null,
      invoices: []
    };
  }

  const item = subscription.items.data[0];
  const price = item?.price ?? null;
  const product = price && typeof price.product !== "string" ? price.product : null;
  const inferred = inferPlanName({
    lookupKey: price?.lookup_key,
    nickname: price?.nickname,
    productName: product?.name,
    priceId: price?.id
  });

  const invoices = await client.invoices.list(
    {
      customer: customerId,
      subscription: subscription.id,
      limit: 12
    },
    requestOptions
  );

  return {
    customerId,
    subscriptionId: subscription.id,
    status: subscription.status,
    planKey: inferred.planKey,
    planName: inferred.planName,
    price: typeof price?.unit_amount === "number" ? price.unit_amount / 100 : null,
    currency: price?.currency?.toUpperCase() ?? "PKR",
    interval: price?.recurring?.interval ?? null,
    nextBillingDate: toIsoFromEpoch(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    priceId: price?.id ?? null,
    productId: typeof price?.product === "string" ? price.product : product?.id ?? null,
    productName: product?.name ?? null,
    trialEndsAt: toIsoFromEpoch(subscription.trial_end),
    invoices: invoices.data.map((invoice) => ({
      id: invoice.id,
      date: toIsoFromEpoch(invoice.status_transitions?.paid_at ?? invoice.created) ?? new Date().toISOString(),
      planName: deriveInvoicePlanName(invoice, inferred.planName),
      amount: invoice.amount_paid / 100,
      currency: (invoice.currency ?? price?.currency ?? "pkr").toUpperCase(),
      status: invoice.status ?? "open",
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
      pdfUrl: invoice.invoice_pdf ?? null
    }))
  };
}

export async function createClinicBillingPortalSession(input: {
  clientId: string;
  origin: string;
}) {
  const profile = await getLatestBillingProfile(input.clientId);
  const stripeKey = (resolveSecretValue(profile?.key_ref) ?? env.stripeSecretKey) || undefined;
  const client = getStripeClient(stripeKey);
  const customerId = profile?.stripe_customer_id?.trim() ?? null;

  if (!client || !customerId) {
    throw new Error("Billing profile is not ready for portal access");
  }

  const requestOptions = profile?.stripe_account_id ? { stripeAccount: profile.stripe_account_id } : undefined;
  return client.billingPortal.sessions.create(
    {
      customer: customerId,
      return_url: `${input.origin}/billing`
    },
    requestOptions
  );
}
