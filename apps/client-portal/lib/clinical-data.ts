import { createSupabaseServiceClient } from "@nextwave/database";
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

function getSupabase() {
  return createSupabaseServiceClient();
}

export async function getClinicalWorkspaceSummary(clientId: string) {
  const clinicProfileId = await resolveClinicProfileId(clientId);
  if (!clinicProfileId) {
    return { patientCount: 0, visitCount: 0, latestPatients: [], latestVisits: [] };
  }
  const supabase = getSupabase();

  const [{ count: patientCount }, { count: visitCount }, { data: latestPatients }, { data: latestVisits }] = await Promise.all([
    supabase.from("patients").select("id", { count: "exact", head: true }).eq("clinic_id", clinicProfileId).eq("is_deleted", false),
    supabase.from("visits").select("id", { count: "exact", head: true }).eq("clinic_id", clinicProfileId).eq("is_deleted", false),
    supabase
      .from("patients")
      .select("id, full_name, patient_code, updated_at")
      .eq("clinic_id", clinicProfileId)
      .eq("is_deleted", false)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("visits")
      .select("id, patient_id, assessment, visit_date")
      .eq("clinic_id", clinicProfileId)
      .eq("is_deleted", false)
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
    .eq("is_deleted", false)
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
    .eq("is_deleted", false)
    .maybeSingle<PatientRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
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
    .eq("is_deleted", false)
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
    .eq("is_deleted", false)
    .maybeSingle<VisitRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
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

