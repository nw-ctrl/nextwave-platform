import { NextResponse } from "next/server";
import { requirePlatformRole } from "../../../../lib/authz";
import { createSupabaseServiceClient } from "@nextwave/database";

export async function POST(request: Request) {
  try {
    // Only Superuser can make these codes
    await requirePlatformRole(request, ["superuser"]);
    
    const body = await request.json();
    const supabase = createSupabaseServiceClient();
    
    // Auto-generate code if they left it blank
    const codeToUse = body.code?.trim() || `VIP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data, error } = await supabase
      .from("promo_codes")
      .insert({
        code: codeToUse,
        free_months: body.free_months || 6,
        plan_tier: body.plan_tier || "Premium",
        is_used: false
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, code: data.code });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
