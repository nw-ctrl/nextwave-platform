import { Suspense } from "react";
import { BillingCheckoutCard } from "../../../components/billing-checkout-card";
import { getClientPortalAccess } from "../../../lib/access";
import { createSupabaseServiceClient } from "@nextwave/database";

async function getClinicName(clientId: string) {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from("clients").select("name").eq("id", clientId).maybeSingle<{ name: string }>();
  return data?.name ?? "Clinic";
}

export default async function Page({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const userId = typeof resolvedSearchParams.userId === "string" ? resolvedSearchParams.userId : null;
  const clientId = typeof resolvedSearchParams.clientId === "string" ? resolvedSearchParams.clientId : null;

  if (!userId || !clientId) {
    return (
      <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h1>Billing</h1>
        <p>Missing clinic context. Open this page with both `userId` and `clientId` in the URL.</p>
      </main>
    );
  }

  const access = await getClientPortalAccess({ userId, clientId });
  const roleAllowed = access.isPlatformAdmin || access.role === "admin" || access.role === "manager";
  const moduleAllowed = access.isPlatformAdmin || access.modules.length === 0 || access.modules.includes("billing");

  if (!roleAllowed || !moduleAllowed) {
    return (
      <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h1>Billing</h1>
        <p>Your account does not currently have permission to manage clinic billing.</p>
      </main>
    );
  }

  const clinicName = await getClinicName(clientId);

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <Suspense fallback={<p>Loading billing checkout...</p>}>
        <BillingCheckoutCard clientId={clientId} userId={userId} role={access.role} clinicName={clinicName} />
      </Suspense>
    </main>
  );
}
