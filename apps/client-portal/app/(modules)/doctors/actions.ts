"use server";

import { requirePortalContext } from "@/lib/auth";
import { createSupabaseServiceClient } from "@nextwave/database";
import { revalidatePath } from "next/cache";

type DoctorProfilePayload = {
  full_name?: string;
  qualification?: string | null;
  pmdc_no?: string | null;
  prescription_header?: string | null;
  prescription_footer?: string | null;
  letterhead_image_path?: string | null;
  prescription_font_size?: number | string | null;
  pdf_line_offset?: number | string | null;
  pdf_signature_y?: number | string | null;
  pdf_date_x?: number | string | null;
};

function normalizeText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeNumber(value: unknown, fallback: number | null = null) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

async function resolveDoctorTarget(clientId: string) {
  const supabase = createSupabaseServiceClient();

  const { data: profileRef } = await supabase
    .from("clinic_profiles")
    .select("id")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!profileRef?.id) {
    throw new Error("No clinic profile linked to this workspace");
  }

  const { data: members } = await supabase
    .from("clinic_members")
    .select("user_id")
    .eq("clinic_id", profileRef.id)
    .in("role", ["Doctor", "Admin"])
    .order("role", { ascending: true })
    .limit(1);

  if (!members || members.length === 0) {
    throw new Error("No doctor profile found for this clinic");
  }

  return {
    supabase,
    clinicProfileId: profileRef.id,
    targetUserId: members[0].user_id,
  };
}

async function syncLegacyDoctorProfileRecord(
  clinicProfileId: string,
  targetUserId: string,
  payload: {
    pmdc_no: string | null;
    qualification: string | null;
    letterhead_image_path: string | null;
  },
  supabase = createSupabaseServiceClient()
) {
  const { data: existingSyncProfile } = await supabase
    .from("doctor_profiles")
    .select("id")
    .eq("clinic_profile_id", clinicProfileId)
    .eq("user_id", targetUserId)
    .limit(1)
    .maybeSingle();

  const syncPayload = {
    clinic_profile_id: clinicProfileId,
    user_id: targetUserId,
    license_number: payload.pmdc_no,
    specialty: payload.qualification,
    header_path: payload.letterhead_image_path,
  };

  if (existingSyncProfile?.id) {
    const { error } = await supabase
      .from("doctor_profiles")
      .update(syncPayload)
      .eq("id", existingSyncProfile.id);

    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const { error } = await supabase.from("doctor_profiles").insert(syncPayload);
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateDoctorProfile(clientId: string, profileData: DoctorProfilePayload) {
  const { membership } = await requirePortalContext();

  if (membership.clientId !== clientId) {
    throw new Error("Unauthorized");
  }

  const { supabase, clinicProfileId, targetUserId } = await resolveDoctorTarget(clientId);

  const updates = {
    full_name: normalizeText(profileData.full_name) ?? "Doctor",
    qualification: normalizeText(profileData.qualification),
    pmdc_no: normalizeText(profileData.pmdc_no),
    prescription_header: normalizeText(profileData.prescription_header),
    prescription_footer: normalizeText(profileData.prescription_footer),
    letterhead_image_path: normalizeText(profileData.letterhead_image_path),
    prescription_font_size: normalizeNumber(profileData.prescription_font_size, 14),
    pdf_line_offset: normalizeNumber(profileData.pdf_line_offset, 12),
    pdf_signature_y: normalizeNumber(profileData.pdf_signature_y, 150),
    pdf_date_x: normalizeNumber(profileData.pdf_date_x, 140),
  };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", targetUserId);

  if (error) {
    throw new Error(error.message);
  }

  await syncLegacyDoctorProfileRecord(clinicProfileId, targetUserId, updates, supabase);

  revalidatePath("/doctors");
  revalidatePath("/patients");
  return { success: true };
}

export async function uploadDoctorLetterhead(clientId: string, formData: FormData) {
  const { membership } = await requirePortalContext();

  if (membership.clientId !== clientId) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("No letterhead file received");
  }

  if (file.size === 0) {
    throw new Error("The selected file is empty");
  }

  const { supabase, clinicProfileId, targetUserId } = await resolveDoctorTarget(clientId);
  const extension =
    file.name.split(".").pop()?.toLowerCase() ||
    file.type.split("/").pop()?.toLowerCase() ||
    "png";
  const remotePath = `${targetUserId}/letterhead.${extension}`;
  const contentType = file.type || `image/${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("letterheads")
    .upload(remotePath, bytes, {
      upsert: true,
      contentType,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ letterhead_image_path: remotePath })
    .eq("id", targetUserId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("pmdc_no, qualification")
    .eq("id", targetUserId)
    .maybeSingle();

  await syncLegacyDoctorProfileRecord(
    clinicProfileId,
    targetUserId,
    {
      pmdc_no: currentProfile?.pmdc_no ?? null,
      qualification: currentProfile?.qualification ?? null,
      letterhead_image_path: remotePath,
    },
    supabase
  );

  revalidatePath("/doctors");
  revalidatePath("/patients");

  return {
    success: true,
    path: remotePath,
    publicUrl: supabase.storage.from("letterheads").getPublicUrl(remotePath).data.publicUrl,
  };
}
