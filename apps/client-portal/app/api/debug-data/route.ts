import { createSupabaseServiceClient } from "@nextwave/database";
import { getPortalSession } from "@/lib/auth";

export async function GET() {
  const session = await getPortalSession();
  if (!session) return Response.json({ error: "No session" });

  const clientId = session.selectedClientId || session.memberships[0]?.clientId;
  const supabase = createSupabaseServiceClient();

  const { data: profileRef } = await supabase
    .from("clinic_profiles")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();

  const clinicProfileId = profileRef?.id;
  let countResult = null;
  let patientsResult = null;

  if (clinicProfileId) {
     countResult = await supabase
      .from("patients")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicProfileId);
      
     patientsResult = await supabase
      .from("patients")
      .select("*")
      .eq("clinic_id", clinicProfileId)
      .limit(10);
  }

  return Response.json({
    clientId,
    clinicProfileId,
    resolvedProfile: profileRef,
    countResult,
    patientsResult,
    debugAllPatients: (await supabase.from("patients").select("id, clinic_id, full_name, is_deleted").limit(10)).data
  });
}
