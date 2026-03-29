import { createSupabaseServiceClient } from "@nextwave/database";

export type ClinicUsageMetrics = {
  clientId: string;
  patientCount: number;
  visitCount: number;
  storageBytes: number;
  lastScannedAt: string;
};

/**
 * Aggregates real-time usage metrics for a specific clinic.
 * This scans row counts and storage buckets to determine active footprint.
 */
export async function getClinicUsage(clientId: string): Promise<ClinicUsageMetrics> {
  const supabase = createSupabaseServiceClient();

  const { data: profileRef } = await supabase
    .from("clinic_profiles")
    .select("id")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!profileRef?.id) {
    return {
      clientId,
      patientCount: 0,
      visitCount: 0,
      storageBytes: 0,
      lastScannedAt: new Date().toISOString()
    };
  }

  // 1. Fetch Row Counts
  const [patientsResult, visitsResult] = await Promise.all([
    supabase.from("patients").select("id", { count: "exact", head: true }).eq("clinic_id", profileRef.id).eq("is_deleted", false),
    supabase.from("visits").select("id", { count: "exact", head: true }).eq("clinic_id", profileRef.id).eq("is_deleted", false)
  ]);

  if (patientsResult.error) throw new Error(`Patient count failed: ${patientsResult.error.message}`);
  if (visitsResult.error) throw new Error(`Visit count failed: ${visitsResult.error.message}`);

  // 2. Fetch Storage Usage (Visit Reports)
  // visit-reports bucket structure is [clientId]/[patientId]/[visitId].jpg
  const visitReportsBucket = supabase.storage.from("visit-reports");
  let totalStorageBytes = 0;

  try {
    const { data: patientFolders, error: listError } = await visitReportsBucket.list(clientId);
    if (!listError && patientFolders) {
      // For each patient folder, list contents to get sizes
      // Note: This can be expensive if there are thousands of patients. 
      // In a production app, we would ideally store 'size' in the 'visits' table during upload.
      // For now, we perform a shallow scan of the first few to estimate or list all if small.
      const patientScans = await Promise.all(
          patientFolders.map(folder => visitReportsBucket.list(`${clientId}/${folder.name}`))
      );

      patientScans.forEach(({ data }) => {
          data?.forEach(file => {
              totalStorageBytes += (file.metadata?.size ?? 0);
          });
      });
    }
  } catch (e) {
    console.error("Storage scan failed", e);
  }

  return {
    clientId,
    patientCount: patientsResult.count ?? 0,
    visitCount: visitsResult.count ?? 0,
    storageBytes: totalStorageBytes,
    lastScannedAt: new Date().toISOString()
  };
}

/**
 * Persists usage metrics to the historical tracking table.
 */
export async function persistUsageMetrics(metrics: ClinicUsageMetrics) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("usage_metrics").insert({
    client_id: metrics.clientId,
    metric_type: "database_usage",
    value: metrics.visitCount, // Use visits as primary activity metric for Tier 1
    metadata: {
      patientCount: metrics.patientCount,
      storageBytes: metrics.storageBytes,
      scannedAt: metrics.lastScannedAt
    }
  });

  if (error) throw new Error(`Metric persistence failed: ${error.message}`);
}
