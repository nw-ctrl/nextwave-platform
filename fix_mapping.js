const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMapping() {
  const WEB_WORKSPACE_ID = "4faf1649-8b03-4a29-93b5-2bd01a01f37a";
  const ANDROID_CLINIC_ID = "c44910aa-8032-42cd-a994-b7ae561ad992";
  const CLINIC_NAME = "Medica Almadina - Motorway City";

  console.log(`Setting up mapping for ${CLINIC_NAME}...`);
  
  const { data, error } = await supabase
    .from("clinic_profiles")
    .upsert({
      id: ANDROID_CLINIC_ID,
      client_id: WEB_WORKSPACE_ID,
      clinic_name: CLINIC_NAME
    }, { onConflict: "id" })
    .select();

  if (error) {
    console.error("Error creating mapping:", error.message);
  } else {
    console.log("Success! Mapping created:", data);
  }
}

fixMapping().catch(console.error);
