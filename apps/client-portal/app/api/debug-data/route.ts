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
    .eq("client_id", clientId);

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId);

  const { data: allProfiles } = await supabase
    .from("clinic_profiles")
    .select("*")
    .limit(10);

  const { data: allPatients } = await supabase
    .from("patients")
    .select("clinic_id, full_name")
    .limit(10);

  return Response.json({
    clientId,
    boundProfile: profileRef,
    clientSource: clientData,
    debugAllProfiles: allProfiles,
    debugAllPatients: allPatients
  });
}
