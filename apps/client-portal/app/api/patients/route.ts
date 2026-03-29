import { randomUUID } from "crypto";
import { z } from "zod";
import { createSupabaseServiceClient } from "@nextwave/database";
import { requirePortalContext } from "@/lib/auth";

const patientSchema = z.object({
  fullName: z.string().min(2),
  phoneNumber: z.string().optional().nullable(),
  sex: z.string().min(1),
  age: z.coerce.number().int().min(0),
  ageMonths: z.coerce.number().int().min(0).max(11).default(0),
  cnic: z.string().optional().nullable(),
  patientCode: z.string().optional().nullable(),
  digitalConsentGranted: z.boolean().default(false),
});

function createPatientCode() {
  return `PT-${Date.now().toString().slice(-6)}`;
}

export async function POST(request: Request) {
  try {
    const { clientId, userId } = await requirePortalContext();
    const body = patientSchema.parse(await request.json());
    const supabase = createSupabaseServiceClient();

    const patient = {
      id: randomUUID(),
      clinic_id: clientId,
      doctor_id: userId,
      patient_code: body.patientCode?.trim() || createPatientCode(),
      full_name: body.fullName.trim(),
      phone_number: body.phoneNumber?.trim() || null,
      cnic: body.cnic?.trim() || null,
      sex: body.sex,
      age: body.age,
      age_months: body.ageMonths,
      digital_consent_granted: body.digitalConsentGranted,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
    };

    const { error } = await supabase.from("patients").insert(patient);
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ patient });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create patient";
    return Response.json({ error: message }, { status: 400 });
  }
}

