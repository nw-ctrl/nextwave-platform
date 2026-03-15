import { createClinicSubscriptionCheckoutSession } from "../../../../lib/subscription";
import { requireClientModule } from "../../../../lib/authz";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      clientId?: string;
      customerEmail?: string;
      appId?: string;
      couponId?: string;
      tier?: 'basic' | 'standard' | 'premium'; // <-- Added tier
      priceId?: string; // <-- Kept for compatibility if dropdown sends tier name here
    };

    if (!body.clientId) {
      return Response.json({ error: "Missing clientId" }, { status: 400 });
    }

    // 1. Determine the tier (defaults to standard). 
    // It accepts it from `body.tier`, or from `body.priceId` if the dropdown sends the name there.
    const tier = body.tier || (body.priceId as 'basic' | 'standard' | 'premium') || 'standard';

    // 2. Map the tier to the environment variables
    const priceIdMap: Record<'basic' | 'standard' | 'premium', string | undefined> = {
      basic: process.env.STRIPE_PRICE_BASIC,
      standard: process.env.STRIPE_PRICE_STANDARD,
      premium: process.env.STRIPE_PRICE_PREMIUM,
    };

    // 3. Resolve the final Stripe Price ID
    // If the frontend dropdown passed a literal Stripe ID (starts with "price_"), use it directly.
    // Otherwise, use the environment variable mapped to the selected tier.
    const finalPriceId = body.priceId?.startsWith("price_") 
      ? body.priceId 
      : priceIdMap[tier];

    if (!finalPriceId) {
      return Response.json({ error: `Missing Stripe Price configuration for ${tier} tier` }, { status: 500 });
    }

    const actorUserId = await requireClientModule(request, body.clientId, "billing", ["admin"]);
    const origin = process.env.NEXT_PUBLIC_ADMIN_URL || new URL(request.url).origin;

    const result = await createClinicSubscriptionCheckoutSession({
      clientId: body.clientId,
      customerEmail: body.customerEmail,
      appId: body.appId ?? "medivault",
      couponId: body.couponId,
      priceId: finalPriceId, // <-- Pass the properly resolved Stripe Price ID
      origin
    });

    return Response.json({ ok: true, actorUserId, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed_to_create_billing_checkout";
    return Response.json({ ok: false, error: message }, { status: 403 });
  }
}
