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

export async function PATCH(request: Request, { params }: { params: Promise<{ patientId: string }> }) {
  try {
    const { clientId } = await requirePortalContext();
    const { patientId } = await params;
    const body = patientSchema.parse(await request.json());
    const supabase = createSupabaseServiceClient();

    const updates = {
      patient_code: body.patientCode?.trim() || null,
      full_name: body.fullName.trim(),
      phone_number: body.phoneNumber?.trim() || null,
      cnic: body.cnic?.trim() || null,
      sex: body.sex,
      age: body.age,
      age_months: body.ageMonths,
      digital_consent_granted: body.digitalConsentGranted,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("patients")
      .update(updates)
      .eq("clinic_id", clientId)
      .eq("id", patientId)
      .neq("is_deleted", true)
      .select("*")
      .maybeSingle();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    return Response.json({ patient: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update patient";
    return Response.json({ error: message }, { status: 400 });
  }
}
