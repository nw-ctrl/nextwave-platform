import { createSupabaseServiceClient } from "@nextwave/database";
import { env } from "@nextwave/config";
import { builtInClinicalTemplates } from "@/lib/clinical-templates";

export type PatientRecord = {
  id: string;
  clinic_id: string;
  doctor_id: string;
  patient_code: string | null;
  full_name: string;
  phone_number: string | null;
  cnic: string | null;
  sex: string | null;
  age: number | null;
  age_months: number | null;
  digital_consent_granted: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean | null;
};

export type VisitRecord = {
  id: string;
  patient_id: string;
  clinic_id: string;
  doctor_id: string;
  subjective: string | null;
  bp: string | null;
  temp: string | null;
  weight: string | null;
  assessment: string | null;
  plan: string | null;
  visit_date: string | null;
  revisit_date: string | null;
  updated_at: string | null;
  is_deleted: boolean | null;
  report_path: string | null;
};

export type PrescriptionTemplateRecord = {
  id: string;
  name: string;
  payload: Record<string, unknown> | null;
  updated_at: string | null;
};

export type DoctorProfileRecord = {
  id: string;
  full_name: string;
  pmdc_no: string | null;
  qualification: string | null;
  signature_y_offset: number | null;
  header_path: string | null;
  footer_path: string | null;
  letterhead_image_path?: string | null;
  letterhead_image_url?: string | null;
  prescription_header?: string | null;
  prescription_footer?: string | null;
  prescription_font_size?: number | null;
  pdf_line_offset?: number | null;
  pdf_signature_y?: number | null;
  pdf_date_x?: number | null;
};

function getSupabase() {
  return createSupabaseServiceClient();
}

function resolveStoragePublicUrl(bucket: string, path?: string | null) {
  const trimmed = path?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (!env.supabaseUrl) return null;
  return `${env.supabaseUrl}/storage/v1/object/public/${bucket}/${trimmed}`;
}

export async function getClinicalWorkspaceSummary(clientId: string) {
  const clinicProfileId = await resolveClinicProfileId(clientId);
  if (!clinicProfileId) {
    return { patientCount: 0, visitCount: 0, latestPatients: [], latestVisits: [] };
  }
  const supabase = getSupabase();

  const [{ count: patientCount }, { count: visitCount }, { data: latestPatients }, { data: latestVisits }] = await Promise.all([
    supabase.from("patients").select("id", { count: "exact", head: true }).eq("clinic_id", clinicProfileId).neq("is_deleted", true),
    supabase.from("visits").select("id", { count: "exact", head: true }).eq("clinic_id", clinicProfileId).neq("is_deleted", true),
    supabase
      .from("patients")
      .select("id, full_name, patient_code, updated_at")
      .eq("clinic_id", clinicProfileId)
      .neq("is_deleted", true)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("visits")
      .select("id, patient_id, assessment, visit_date")
      .eq("clinic_id", clinicProfileId)
      .neq("is_deleted", true)
      .order("visit_date", { ascending: false })
      .limit(5),
  ]);

  return {
    patientCount: patientCount ?? 0,
    visitCount: visitCount ?? 0,
    latestPatients: latestPatients ?? [],
    latestVisits: latestVisits ?? [],
  };
}

export async function listPatients(clientId: string, query?: string) {
  const clinicProfileId = await resolveClinicProfileId(clientId);
  if (!clinicProfileId) return [];
  const supabase = getSupabase();
  let builder = supabase
    .from("patients")
    .select("id, clinic_id, doctor_id, patient_code, full_name, phone_number, cnic, sex, age, age_months, digital_consent_granted, created_at, updated_at, is_deleted")
    .eq("clinic_id", clinicProfileId)
    .neq("is_deleted", true)
    .order("full_name", { ascending: true });

  const trimmed = query?.trim();
  if (trimmed) {
    const escaped = trimmed.replaceAll(",", "");
    builder = builder.or(`full_name.ilike.%${escaped}%,phone_number.ilike.%${escaped}%,cnic.ilike.%${escaped}%,patient_code.ilike.%${escaped}%`);
  }

  const { data, error } = await builder.returns<PatientRecord[]>();
  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getPatientById(clientId: string, patientId: string) {
  const clinicProfileId = await resolveClinicProfileId(clientId);
  if (!clinicProfileId) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("patients")
    .select("id, clinic_id, doctor_id, patient_code, full_name, phone_number, cnic, sex, age, age_months, digital_consent_granted, created_at, updated_at, is_deleted")
    .eq("clinic_id", clinicProfileId)
    .eq("id", patientId)
    .neq("is_deleted", true)
    .maybeSingle<PatientRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listClinicDoctors(clientId: string) {
  const clinicProfileId = await resolveClinicProfileId(clientId);
  if (!clinicProfileId) return [];
  const supabase = getSupabase();

  const { data: members } = await supabase
    .from("clinic_members")
    .select("user_id")
    .eq("clinic_id", clinicProfileId)
    .in("role", ["Doctor", "Admin"]);

  if (!members || members.length === 0) return [];
  const userIds = members.map((member) => member.user_id);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, pmdc_no, qualification, prescription_header, prescription_footer, letterhead_image_path, prescription_font_size, pdf_line_offset, pdf_signature_y, pdf_date_x")
    .in("id", userIds)
    .order("full_name", { ascending: true });

  const { data: syncProfiles } = await supabase
    .from("doctor_profiles")
    .select("user_id, header_path, footer_path, license_number, specialty")
    .in("user_id", userIds);

  return (profiles ?? []).map((profile) => {
    const sync = syncProfiles?.find((item) => item.user_id === profile.id);
    return {
      ...profile,
      header_path: resolveStoragePublicUrl("letterheads", profile.letterhead_image_path) ?? sync?.header_path ?? null,
      footer_path: sync?.footer_path ?? null,
      letterhead_image_path: profile.letterhead_image_path ?? null,
      letterhead_image_url: resolveStoragePublicUrl("letterheads", profile.letterhead_image_path),
      pmdc_no: profile.pmdc_no ?? sync?.license_number ?? null,
      qualification: profile.qualification ?? sync?.specialty ?? null,
    };
  });
}

export async function getDoctorProfile(clientId: string, doctorId: string) {
  const supabase = getSupabase();

  const [{ data: profile }, { data: syncProfile }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", doctorId)
      .maybeSingle<DoctorProfileRecord>(),
    supabase
      .from("doctor_profiles")
      .select("*")
      .eq("user_id", doctorId)
      .maybeSingle<any>()
  ]);

  if (!profile && !syncProfile) return null;

  return {
    ...profile,
    full_name: profile?.full_name || syncProfile?.full_name || "Doctor",
    header_path:
      resolveStoragePublicUrl("letterheads", profile?.letterhead_image_path) ||
      syncProfile?.header_path ||
      profile?.header_path ||
      null,
    footer_path: syncProfile?.footer_path || profile?.footer_path || null,
    letterhead_image_path: profile?.letterhead_image_path || null,
    letterhead_image_url: resolveStoragePublicUrl("letterheads", profile?.letterhead_image_path),
    pmdc_no: profile?.pmdc_no || syncProfile?.license_number || null,
    qualification: profile?.qualification || syncProfile?.specialty || null,
    prescription_header: profile?.prescription_header || syncProfile?.prescription_header || null,
    prescription_footer: profile?.prescription_footer || syncProfile?.prescription_footer || null,
    prescription_font_size: profile?.prescription_font_size ?? syncProfile?.prescription_font_size ?? null,
    pdf_line_offset: profile?.pdf_line_offset ?? syncProfile?.pdf_line_offset ?? null,
    pdf_signature_y: profile?.pdf_signature_y ?? syncProfile?.pdf_signature_y ?? null,
    pdf_date_x: profile?.pdf_date_x ?? syncProfile?.pdf_date_x ?? null,
  } as DoctorProfileRecord;
}

export async function listVisitsForPatient(clientId: string, patientId: string) {
  const clinicProfileId = await resolveClinicProfileId(clientId);
  if (!clinicProfileId) return [];
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("visits")
    .select("id, patient_id, clinic_id, doctor_id, subjective, bp, temp, weight, assessment, plan, visit_date, revisit_date, updated_at, is_deleted, report_path")
    .eq("clinic_id", clinicProfileId)
    .eq("patient_id", patientId)
    .neq("is_deleted", true)
    .order("visit_date", { ascending: false })
    .returns<VisitRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getVisitById(clientId: string, patientId: string, visitId: string) {
  const clinicProfileId = await resolveClinicProfileId(clientId);
  if (!clinicProfileId) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("visits")
    .select("id, patient_id, clinic_id, doctor_id, subjective, bp, temp, weight, assessment, plan, visit_date, revisit_date, updated_at, is_deleted, report_path")
    .eq("clinic_id", clinicProfileId)
    .eq("patient_id", patientId)
    .eq("id", visitId)
    .neq("is_deleted", true)
    .maybeSingle<VisitRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getClinicProfile(clientId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("clinic_profiles")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getClinicBranding(clientId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tenant_branding")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();

  return data;
}

export async function listClinicTemplates(clientId: string) {
  const clinicProfileId = await resolveClinicProfileId(clientId);
  if (!clinicProfileId) return [];
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("prescription_templates")
    .select("*")
    .eq("clinic_profile_id", clinicProfileId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function resolveClinicProfileId(clientId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("clinic_profiles")
    .select("id")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

export async function listPrescriptionTemplates(clientId: string) {
  const clinicProfileId = await resolveClinicProfileId(clientId);
  if (!clinicProfileId) {
    return [] as PrescriptionTemplateRecord[];
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("prescription_templates")
    .select("id, name, payload, updated_at")
    .eq("clinic_profile_id", clinicProfileId)
    .order("updated_at", { ascending: false })
    .returns<PrescriptionTemplateRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export function getDisplayTemplates(records: PrescriptionTemplateRecord[]) {
  if (records.length > 0) {
    return records.map((record) => ({
      id: record.id,
      name: record.name,
      diagnosis: typeof record.payload?.diagnosis === "string" ? record.payload.diagnosis : "",
      prescription: typeof record.payload?.prescription === "string" ? record.payload.prescription : "",
      notes: typeof record.payload?.notes === "string" ? record.payload.notes : "",
      source: "clinic" as const,
    }));
  }

  return builtInClinicalTemplates.map((template, index) => ({
    id: `builtin-${index}`,
    ...template,
    source: "builtin" as const,
  }));
}
