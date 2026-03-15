import { createClinicPortalCheckoutSession } from "../../../../lib/billing";
import { requirePortalContext } from "../../../../lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("[Checkout API] Starting checkout request...");
    
    const body = await request.json().catch(() => ({}));
    console.log("[Checkout API] Received body:", body);

    const portalContext = await requirePortalContext({ allowedRoles: ["admin", "manager"], moduleKey: "billing" });
    
    if (body.clientId && body.clientId !== portalContext.clientId) {
      return NextResponse.json({ error: "Clinic context mismatch" }, { status: 403 });
    }

    const TIER_PRICES: Record<string, string | undefined> = {
      basic: process.env.STRIPE_BASIC_PRICE_ID,
      standard: process.env.STRIPE_STANDARD_PRICE_ID || process.env.STRIPE_MEDIVAULT_MONTHLY_PRICE_ID,
      premium: process.env.STRIPE_PREMIUM_PRICE_ID
    };

    const selectedTier = body.tier || "standard";
    const resolvedPriceId = TIER_PRICES[selectedTier];

    console.log(`[Checkout API] Tier requested: ${selectedTier}, Resolved Price ID: ${resolvedPriceId ? "FOUND" : "MISSING"}`);

    if (!resolvedPriceId) {
       return NextResponse.json(
         { error: `Missing Vercel Env Var for ${selectedTier} tier. Please add STRIPE_${selectedTier.toUpperCase()}_PRICE_ID.` }, 
         { status: 500 }
       );
    }

    const origin = process.env.NEXT_PUBLIC_PORTAL_ORIGIN || new URL(request.url).origin;
    
    console.log("[Checkout API] Creating Stripe Session...");
    const result = await createClinicPortalCheckoutSession({
      clientId: portalContext.clientId,
      userId: portalContext.userId,
      customerEmail: body.customerEmail,
      priceId: resolvedPriceId,
      origin
    });

    console.log("[Checkout API] Session created successfully!");
    return NextResponse.json({ ok: true, ...result });

  } catch (error) {
    console.error("[Checkout API Error]", error);
    const message = error instanceof Error ? error.message : "failed_to_create_clinic_checkout";
    const status = message === "Unauthenticated" ? 401 : message.includes("denied") || message.includes("required") ? 403 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
