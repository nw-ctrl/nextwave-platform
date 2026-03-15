import { NextRequest } from "next/server";
import { createCheckoutSession } from "../../../../lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
    const priceId = process.env.STRIPE_PLATFORM_PRICE_ID ?? "";
    const platformClientId = process.env.STRIPE_PLATFORM_CLIENT_ID ?? "";

    if (!publishableKey) {
      return Response.json({ error: "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" }, { status: 500 });
    }

    if (!priceId) {
      return Response.json({ error: "Missing STRIPE_PLATFORM_PRICE_ID" }, { status: 500 });
    }

    if (!platformClientId) {
      return Response.json({ error: "Missing STRIPE_PLATFORM_CLIENT_ID" }, { status: 500 });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const session = await createCheckoutSession({
      origin,
      priceId,
      platformClientId,
      customerEmail: typeof body.email === "string" ? body.email : undefined
    });

    return Response.json({
      sessionId: session.id,
      url: session.url,
      publishableKey
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "checkout_session_failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
