import { NextResponse } from "next/server";
import { listStripeCoupons, createStripeCoupon } from "../../../../lib/subscription";
import { requirePlatformRole } from "../../../../lib/authz";

export async function GET(request: Request) {
  try {
    await requirePlatformRole(request, ["superuser"]);
    const coupons = await listStripeCoupons();
    return NextResponse.json({ items: coupons });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Fetch coupons failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requirePlatformRole(request, ["superuser"]);
    const body = await request.json();

    const result = await createStripeCoupon({
      name: body.name,
      promoCodeText: body.promoCodeText, // <-- NEW: Passes the text code to Stripe
      percentOff: body.percentOff,
      amountOff: body.amountOff,
      currency: body.currency ?? "pkr",
      duration: body.duration ?? "once",
      durationInMonths: body.durationInMonths,
      maxRedemptions: body.maxRedemptions,
      redeemBy: body.redeemBy
    });

    // Return the result object (which now contains { coupon, promoCode })
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Create coupon failed" }, { status: 500 });
  }
}

