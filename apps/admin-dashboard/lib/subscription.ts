import Stripe from "stripe";
import { env } from "@nextwave/config";

let stripe: Stripe | null = null;

function getStripe() {
  if (!env.stripeSecretKey) {
    return null;
  }

  if (!stripe) {
    stripe = new Stripe(env.stripeSecretKey);
  }

  return stripe;
}

export async function getSubscriptionStatus(customerId: string) {
  const client = getStripe();
  if (!client) {
    return { status: "inactive", source: "missing_stripe_key" };
  }

  const subscriptions = await client.subscriptions.list({ customer: customerId, limit: 1 });
  const sub = subscriptions.data[0];
  return {
    status: sub?.status ?? "inactive",
    currentPeriodEnd: sub ? new Date(sub.current_period_end * 1000).toISOString() : null
  };
}

export async function enforceSubscriptionAccess(customerId: string) {
  const sub = await getSubscriptionStatus(customerId);
  const allowed = sub.status === "active" || sub.status === "trialing";
  return { allowed, ...sub };
}