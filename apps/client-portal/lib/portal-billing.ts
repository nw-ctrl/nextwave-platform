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

export type ClinicBillingDiscount = {
  label: string;
  amountOff: number | null;
  percentOff: number | null;
  duration: string | null;
  durationInMonths: number | null;
  currency: string | null;
  isLifetime: boolean;
  isFounderOffer: boolean;
};

export type ClinicBillingSummary = {
  customerId: string | null;
  subscriptionId: string | null;
  status: string;
  planKey: "basic" | "standard" | "premium" | "custom" | "unknown";
  planName: string;
  price: number | null;
  basePrice: number | null;
  currency: string;
  interval: string | null;
  nextBillingDate: string | null;
  cancelAtPeriodEnd: boolean;
  priceId: string | null;
  productId: string | null;
  productName: string | null;
  trialEndsAt: string | null;
  discount: ClinicBillingDiscount | null;
  invoices: ClinicBillingInvoice[];
};

function resolveSecretValue(ref?: string | null) {
  if (!ref) return undefined;
  if (ref.startsWith("env:")) return process.env[ref.slice(4)];
  return process.env[ref] ?? undefined;
}

function getStripeClient(secretKey?: string) {
  const key = secretKey ?? env.stripeSecretKey;
  if (!key) return null;
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

  if (error) throw new Error(error.message);
  return data;
}

function toIsoFromEpoch(epoch?: number | null) {
  if (!epoch) return null;
  return new Date(epoch * 1000).toISOString();
}

function getPortalPlanDisplayName(planKey: ClinicBillingSummary["planKey"]) {
  switch (planKey) {
    case "basic":
      return "Essential Care";
    case "standard":
      return "Advanced Practice";
    case "premium":
      return "Total Wellness";
    case "custom":
      return "Custom Plan";
    default:
      return "Clinic Subscription";
  }
}

function normalizePlanKey(input?: string | null): ClinicBillingSummary["planKey"] {
  const value = input?.trim().toLowerCase() ?? "";
  if (!value) return "unknown";
  if (value.includes("premium")) return "premium";
  if (value.includes("standard")) return "standard";
  if (value.includes("basic")) return "basic";
  if (value.includes("custom")) return "custom";
  return "unknown";
}

function planFromPriceId(priceId?: string | null) {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
    return { planKey: "basic" as const, planName: getPortalPlanDisplayName("basic") };
  }
  if (priceId === process.env.STRIPE_STANDARD_PRICE_ID || priceId === process.env.STRIPE_MEDIVAULT_MONTHLY_PRICE_ID) {
    return { planKey: "standard" as const, planName: getPortalPlanDisplayName("standard") };
  }
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
    return { planKey: "premium" as const, planName: getPortalPlanDisplayName("premium") };
  }
  return null;
}

function getProductName(product?: Stripe.Product | Stripe.DeletedProduct | null) {
  if (!product || product.deleted) return null;
  return product.name ?? null;
}

function inferPlanName(input: { lookupKey?: string | null; nickname?: string | null; productName?: string | null; priceId?: string | null; }) {
  const mappedPricePlan = planFromPriceId(input.priceId);
  if (mappedPricePlan) return mappedPricePlan;

  const sources = [input.lookupKey, input.nickname, input.productName];
  for (const source of sources) {
    const normalized = normalizePlanKey(source);
    if (normalized !== "unknown") {
      return { planKey: normalized, planName: getPortalPlanDisplayName(normalized) };
    }
  }

  if (input.productName?.trim()) return { planKey: "custom" as const, planName: input.productName.trim() };
  if (input.nickname?.trim()) return { planKey: "custom" as const, planName: input.nickname.trim() };
  return { planKey: "unknown" as const, planName: "Clinic Subscription" };
}

function deriveInvoicePlanName(invoice: Stripe.Invoice, fallback: string) {
  const line = invoice.lines.data.find((item) => item.type === "subscription") ?? invoice.lines.data[0];
  const directPriceId = line && "price" in line ? line.price?.id ?? null : null;
  const mappedPricePlan = planFromPriceId(directPriceId);
  if (mappedPricePlan) return mappedPricePlan.planName;

  const description = line?.description ?? invoice.description ?? "";
  const normalized = normalizePlanKey(description);
  if (normalized !== "unknown") return getPortalPlanDisplayName(normalized);
  return fallback;
}

function deriveDiscount(input: { subscriptionDiscount?: Stripe.Discount | null; upcomingInvoice?: Stripe.UpcomingInvoice | null; price?: Stripe.Price | null; planName: string; }) {
  const coupon = input.subscriptionDiscount?.coupon ?? null;
  const currency = (coupon?.currency ?? input.price?.currency ?? null)?.toUpperCase() ?? null;
  const amountOff = typeof coupon?.amount_off === "number" ? coupon.amount_off / 100 : null;
  const percentOff = coupon?.percent_off ?? null;
  const duration = coupon?.duration ?? null;
  const durationInMonths = coupon?.duration_in_months ?? null;
  const labelSource = coupon?.name ?? null;
  const detectedText = [labelSource, input.planName, input.price?.nickname, input.price?.lookup_key].filter(Boolean).join(" ");
  const isFounderOffer = /found|early|doctor|adopter|lifetime|locked/i.test(detectedText);

  if (coupon) {
    return {
      label: labelSource ?? (percentOff ? `${percentOff}% plan discount` : amountOff && currency ? `${currency} ${amountOff} off` : "Plan discount applied"),
      amountOff,
      percentOff,
      duration,
      durationInMonths,
      currency,
      isLifetime: duration === "forever",
      isFounderOffer
    } satisfies ClinicBillingDiscount;
  }

  const upcomingInvoice = input.upcomingInvoice;
  const baseUnitAmount = typeof input.price?.unit_amount === "number" ? input.price.unit_amount : null;
  if (upcomingInvoice && typeof baseUnitAmount === "number" && upcomingInvoice.total < baseUnitAmount) {
    return {
      label: "Pricing adjustment applied",
      amountOff: (baseUnitAmount - upcomingInvoice.total) / 100,
      percentOff: null,
      duration: null,
      durationInMonths: null,
      currency: (upcomingInvoice.currency ?? input.price?.currency ?? "pkr").toUpperCase(),
      isLifetime: false,
      isFounderOffer
    } satisfies ClinicBillingDiscount;
  }

  return null;
}

export function getReadablePortalPlanName(plan?: string | null) {
  const mappedPricePlan = planFromPriceId(plan);
  if (mappedPricePlan) return mappedPricePlan.planName;

  const normalized = normalizePlanKey(plan);
  if (normalized !== "unknown") return getPortalPlanDisplayName(normalized);
  if (plan?.startsWith("price_")) return "Clinic Subscription";
  return "Clinic Subscription";
}

export async function getClinicBillingSummary(clientId: string): Promise<ClinicBillingSummary | null> {
  const profile = await getLatestBillingProfile(clientId);
  const stripeKey = (resolveSecretValue(profile?.key_ref) ?? env.stripeSecretKey) || undefined;
  const client = getStripeClient(stripeKey);
  const customerId = profile?.stripe_customer_id?.trim() ?? null;
  if (!client || !customerId) return null;

  const requestOptions = profile?.stripe_account_id ? { stripeAccount: profile.stripe_account_id } : undefined;
  const subscriptions = await client.subscriptions.list({ customer: customerId, status: "all", limit: 10 }, requestOptions);
  const summarySubscription = subscriptions.data.find((item) => ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(item.status)) ?? subscriptions.data[0];

  if (!summarySubscription) {
    return { customerId, subscriptionId: null, status: "inactive", planKey: "unknown", planName: "No active plan", price: null, basePrice: null, currency: "PKR", interval: null, nextBillingDate: null, cancelAtPeriodEnd: false, priceId: null, productId: null, productName: null, trialEndsAt: null, discount: null, invoices: [] };
  }

  const subscription = await client.subscriptions.retrieve(summarySubscription.id, { expand: ["discount.coupon"] }, requestOptions);
  const item = subscription.items.data[0];
  const price = item?.price ?? null;
  const linkedProductId = typeof price?.product === "string" ? price.product : price?.product?.id ?? null;

  let productName: string | null = null;
  if (price && typeof price.product !== "string" && price.product) productName = getProductName(price.product);
  if (!productName && linkedProductId) {
    try {
      const fetchedProduct = await client.products.retrieve(linkedProductId, requestOptions);
      productName = getProductName(fetchedProduct);
    } catch {
      productName = null;
    }
  }

  const inferred = inferPlanName({ lookupKey: price?.lookup_key, nickname: price?.nickname, productName, priceId: price?.id });

  let upcomingInvoice: Stripe.Invoice | null = null;
  try {
    const upcoming = await client.invoices.retrieveUpcoming({ customer: customerId, subscription: subscription.id }, requestOptions);
    upcomingInvoice = upcoming as unknown as Stripe.Invoice;
  } catch {
    upcomingInvoice = null;
  }

  const discount = deriveDiscount({ subscriptionDiscount: subscription.discount, upcomingInvoice, price, planName: inferred.planName });
  const invoices = await client.invoices.list({ customer: customerId, subscription: subscription.id, limit: 12 }, requestOptions);
  const basePrice = typeof price?.unit_amount === "number" ? price.unit_amount / 100 : null;
  const effectivePrice = typeof upcomingInvoice?.total === "number" ? upcomingInvoice.total / 100 : basePrice;
  const effectiveNextBillingDate = toIsoFromEpoch(upcomingInvoice?.period_end ?? subscription.current_period_end);

  return {
    customerId,
    subscriptionId: subscription.id,
    status: subscription.status,
    planKey: inferred.planKey,
    planName: inferred.planName,
    price: effectivePrice,
    basePrice,
    currency: (upcomingInvoice?.currency ?? price?.currency ?? "pkr").toUpperCase(),
    interval: price?.recurring?.interval ?? null,
    nextBillingDate: effectiveNextBillingDate,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    priceId: price?.id ?? null,
    productId: linkedProductId,
    productName,
    trialEndsAt: toIsoFromEpoch(subscription.trial_end),
    discount,
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

export async function createClinicBillingPortalSession(input: { clientId: string; origin: string; }) {
  const profile = await getLatestBillingProfile(input.clientId);
  const stripeKey = (resolveSecretValue(profile?.key_ref) ?? env.stripeSecretKey) || undefined;
  const client = getStripeClient(stripeKey);
  const customerId = profile?.stripe_customer_id?.trim() ?? null;
  if (!client || !customerId) throw new Error("Billing profile is not ready for portal access");

  const requestOptions = profile?.stripe_account_id ? { stripeAccount: profile.stripe_account_id } : undefined;
  return client.billingPortal.sessions.create({ customer: customerId, return_url: `${input.origin}/billing` }, requestOptions);
}
