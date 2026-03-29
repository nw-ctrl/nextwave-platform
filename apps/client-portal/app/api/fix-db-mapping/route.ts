import { createSupabaseServiceClient } from "@nextwave/database";

export async function GET() {
  const WEB_WORKSPACE_ID = "4faf1649-8b03-4a29-93b5-2bd01a01f37a";
  const ANDROID_CLINIC_ID = "c44910aa-8032-42cd-a994-b7ae561ad992";
  const CLINIC_NAME = "Medica Almadina - Motorway City";

  const supabase = createSupabaseServiceClient();
  
  const { data, error } = await supabase
    .from("clinic_profiles")
    .upsert({
      id: ANDROID_CLINIC_ID,
      client_id: WEB_WORKSPACE_ID,
      clinic_name: CLINIC_NAME
    }, { onConflict: "id" })
    .select();

  return Response.json({
    success: !error,
    data,
    error: error?.message
  });
}
