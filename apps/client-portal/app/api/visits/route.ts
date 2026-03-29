import { randomUUID } from "crypto";
import { z } from "zod";
import { createSupabaseServiceClient } from "@nextwave/database";
import { requirePortalContext } from "@/lib/auth";

const visitSchema = z.object({
  patientId: z.string().min(1),
  subjective: z.string().optional().nullable(),
  bp: z.string().optional().nullable(),
  temp: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  assessment: z.string().min(2),
  plan: z.string().min(2),
  visitDate: z.string().min(1),
  revisitDate: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const { clientId, userId } = await requirePortalContext();
    const body = visitSchema.parse(await request.json());
    const supabase = createSupabaseServiceClient();

    const visit = {
      id: randomUUID(),
      patient_id: body.patientId,
      clinic_id: clientId,
      doctor_id: userId,
      subjective: body.subjective?.trim() || null,
      bp: body.bp?.trim() || null,
      temp: body.temp?.trim() || null,
      weight: body.weight?.trim() || null,
      assessment: body.assessment.trim(),
      plan: body.plan.trim(),
      visit_date: body.visitDate,
      revisit_date: body.revisitDate?.trim() || null,
      updated_at: new Date().toISOString(),
      is_deleted: false,
      report_path: null,
    };

    const { error } = await supabase.from("visits").insert(visit);
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ visit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create visit";
    return Response.json({ error: message }, { status: 400 });
  }
}

