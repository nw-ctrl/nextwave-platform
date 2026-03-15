export async function createCheckoutSession(input: {
  origin: string;
  priceId: string;
  platformClientId: string;
  customerEmail?: string;
}) {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("success_url", `${input.origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${input.origin}/?checkout=cancel`);
  params.set("line_items[0][price]", input.priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("allow_promotion_codes", "true");
  params.set("billing_address_collection", "auto");
  params.set("client_reference_id", input.platformClientId);
  params.set("metadata[source]", "website");
  params.set("metadata[mode]", "platform");
  params.set("metadata[clientId]", input.platformClientId);
  params.set("subscription_data[metadata][source]", "website");
  params.set("subscription_data[metadata][mode]", "platform");
  params.set("subscription_data[metadata][clientId]", input.platformClientId);

  if (input.customerEmail) {
    params.set("customer_email", input.customerEmail);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString(),
    cache: "no-store"
  });

  const data = (await response.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.id) {
    throw new Error(data.error?.message ?? "Failed to create Stripe checkout session");
  }

  return {
    id: data.id,
    url: data.url ?? null
  };
}
