"use server";

import { requirePortalContext } from "@/lib/auth";
import { createSupabaseServiceClient } from "@nextwave/database";
import { revalidatePath } from "next/cache";

export async function updateDoctorProfile(clientId: string, profileData: any) {
  const { session, membership } = await requirePortalContext();

  if (membership.clientId !== clientId) {
    throw new Error("Unauthorized");
  }

  const supabase = createSupabaseServiceClient();

  // Find the primary doctor for this clinic
  const { data: members } = await supabase
    .from("clinic_members")
    .select("user_id")
    .eq("clinic_id", clientId)
    .in("role", ["Doctor", "Admin"])
    .order("role", { ascending: true })
    .limit(1);

  if (!members || members.length === 0) {
    throw new Error("No doctor profile found for this clinic");
  }

  const targetUserId = members[0].user_id;

  const { id, is_active, ...updates } = profileData;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", targetUserId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/doctors");
  return { success: true };
}
