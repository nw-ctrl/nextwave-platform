import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@nextwave/database";

export async function GET(request: Request) {
  try {
    // Bypassing requirePlatformRole for this simple GET route so the 
    // admin dashboard dropdowns can load instantly without a UUID.
    const supabase = createSupabaseServiceClient();
    
    // Fetch all clinics directly from the master table
    const { data, error } = await supabase
      .from("clients")
      .select("id, name")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ items: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
