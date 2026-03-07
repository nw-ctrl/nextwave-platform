export function verifyStripeWebhook(payload: string, signature: string | null): boolean {
  return Boolean(payload && signature);
}

export function hasActiveSubscription(status: string): boolean {
  return status === "active" || status === "trialing";
}