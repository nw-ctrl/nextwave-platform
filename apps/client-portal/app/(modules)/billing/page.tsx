import { Suspense } from "react";
import { BillingCheckoutCard } from "../../../components/billing-checkout-card";
import { ClinicSelectorCard } from "../../../components/clinic-selector-card";
import { PortalLoginForm } from "../../../components/portal-login-form";
import { getPortalSession } from "../../../lib/auth";

export default async function Page({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const session = await getPortalSession();

  if (!session) {
    return (
      <main
        style={{
          padding: 24,
          fontFamily: "ui-sans-serif, system-ui",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #f8fafc 0%, #eef6f5 100%)"
        }}
      >
        <PortalLoginForm />
      </main>
    );
  }

  if (session.memberships.length === 0) {
    return (
      <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h1>Billing</h1>
        <p>Your account does not have a clinic membership yet.</p>
      </main>
    );
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const roleAllowed = membership.role === "admin" || membership.role === "manager";
  const moduleAllowed = membership.modules.length === 0 || membership.modules.includes("billing");

  if (!roleAllowed || !moduleAllowed) {
    return (
      <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui", display: "grid", gap: 24 }}>
        <ClinicSelectorCard memberships={session.memberships} selectedClientId={session.selectedClientId} />
        <h1>Billing</h1>
        <p>Your account does not currently have permission to manage clinic billing.</p>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "ui-sans-serif, system-ui",
        display: "grid",
        gap: 24,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef6f5 100%)"
      }}
    >
      <ClinicSelectorCard memberships={session.memberships} selectedClientId={session.selectedClientId} />
      <Suspense fallback={<p>Loading billing checkout...</p>}>
        <BillingCheckoutCard clientId={membership.clientId} role={membership.role} clinicName={membership.clinicName} />
      </Suspense>
      {resolvedSearchParams.checkout === "success" ? <p style={{ margin: 0, color: "#065f46" }}>Stripe returned success. Subscription updates are being processed.</p> : null}
    </main>
  );
}
