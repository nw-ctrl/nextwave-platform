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

export async function PATCH(request: Request, { params }: { params: Promise<{ visitId: string }> }) {
  try {
    const { clientId } = await requirePortalContext();
    const { visitId } = await params;
    const body = visitSchema.parse(await request.json());
    const supabase = createSupabaseServiceClient();

    const updates = {
      patient_id: body.patientId,
      subjective: body.subjective?.trim() || null,
      bp: body.bp?.trim() || null,
      temp: body.temp?.trim() || null,
      weight: body.weight?.trim() || null,
      assessment: body.assessment.trim(),
      plan: body.plan.trim(),
      visit_date: body.visitDate,
      revisit_date: body.revisitDate?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("visits")
      .update(updates)
      .eq("clinic_id", clientId)
      .eq("id", visitId)
      .neq("is_deleted", true)
      .select("*")
      .maybeSingle();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return Response.json({ error: "Visit not found" }, { status: 404 });
    }

    return Response.json({ visit: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update diagnosis";
    return Response.json({ error: message }, { status: 400 });
  }
}
