import { createClinicPortalCheckoutSession } from "../../../../lib/billing";
import { requirePortalContext } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      clientId?: string;
      customerEmail?: string;
      tier?: "basic" | "standard" | "premium";
    };
    
    const portalContext = await requirePortalContext({ allowedRoles: ["admin", "manager"], moduleKey: "billing" });
    if (body.clientId && body.clientId !== portalContext.clientId) {
      return Response.json({ error: "Clinic context mismatch" }, { status: 403 });
    }

    const TIER_PRICES: Record<string, string | undefined> = {
      basic: process.env.STRIPE_BASIC_PRICE_ID,
      standard: process.env.STRIPE_STANDARD_PRICE_ID || process.env.STRIPE_MEDIVAULT_MONTHLY_PRICE_ID,
      premium: process.env.STRIPE_PREMIUM_PRICE_ID
    };

    const selectedTier = body.tier || "standard";
    const resolvedPriceId = TIER_PRICES[selectedTier];

    if (!resolvedPriceId) {
       console.error(`[Billing Error] Missing Environment Variable for tier: ${selectedTier}`);
       return Response.json(
         { error: `Pricing configuration error. Missing Price ID for ${selectedTier} tier.` }, 
         { status: 500 }
       );
    }

    const origin = process.env.NEXT_PUBLIC_PORTAL_ORIGIN || new URL(request.url).origin;
    
    const result = await createClinicPortalCheckoutSession({
      clientId: portalContext.clientId,
      userId: portalContext.userId,
      customerEmail: body.customerEmail,
      priceId: resolvedPriceId,
      origin
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("[Checkout Route Error]", error);
    const message = error instanceof Error ? error.message : "failed_to_create_clinic_checkout";
    const status = message === "Unauthenticated" ? 401 : message.includes("denied") || message.includes("required") ? 403 : 500;
    return Response.json({ ok: false, error: message }, { status });
  }
}
