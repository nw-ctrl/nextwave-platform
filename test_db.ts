import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log("Fetching clinics...");
  const { data: clinics } = await supabase.from("clinics").select("*").limit(5);
  console.log("Clinics:", clinics);

  console.log("\nFetching clients...");
  const { data: clients } = await supabase.from("clients").select("*").limit(5);
  console.log("Clients:", clients);

  console.log("\nFetching clinic_profiles...");
  const { data: clinicProfiles } = await supabase.from("clinic_profiles").select("*").limit(5);
  console.log("Clinic Profiles:", clinicProfiles);

  console.log("\nFetching a few patients...");
  const { data: patients } = await supabase.from("patients").select("id, clinic_id, full_name").limit(5);
  console.log("Patients (first 5):", patients);

  console.log("\nFetching clinic_members...");
  const { data: clinicMembers } = await supabase.from("clinic_members").select("*").limit(5);
  console.log("Clinic Members:", clinicMembers);
}

checkData().catch(console.error);
