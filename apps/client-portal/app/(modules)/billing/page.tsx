import { Suspense } from "react";
import { ClinicSelectorCard } from "../../../components/clinic-selector-card";
import { PortalLoginForm } from "../../../components/portal-login-form";
import { getPortalSession } from "../../../lib/auth";
import { PlanStatusCard } from "../../../components/plan-status-card";
import { PremiumUpsellBox } from "../../../components/premium-upsell-box";
import { PricingSection } from "../../../components/pricing-section";

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

  const subscription = membership.subscription;
  const isActive = subscription?.status === "active";
  const isPremium = subscription?.plan?.toLowerCase().includes("premium");
  const isStandard = subscription?.plan?.toLowerCase().includes("standard");

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "ui-sans-serif, system-ui",
        display: "grid",
        gap: 40,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef6f5 100%)",
        alignContent: "start"
      }}
    >
      <ClinicSelectorCard memberships={session.memberships} selectedClientId={session.selectedClientId} />

      <section style={{ maxWidth: 1000, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#111827" }}>Clinic Billing</h1>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280" }}>Manage {membership.clinicName} subscriptions and history.</p>
          </div>
          {resolvedSearchParams.checkout === "success" && (
            <div style={{ background: "#ecfdf5", color: "#065f46", padding: "8px 16px", borderRadius: 12, border: "1px solid #10b981", fontSize: 14, fontWeight: 500 }}>
              Payment completed successfully!
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "start" }}>
          {isActive ? (
            <>
              <PlanStatusCard 
                planName={subscription.plan} 
                price={isPremium ? 5490 : isStandard ? 3990 : 2490} 
                isEarlyAdopter={true} 
                nextBillingDate={subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "TBD"}
              />
              {isStandard && <PremiumUpsellBox />}
            </>
          ) : (
            <div style={{ width: "100%" }}>
              <PricingSection />
            </div>
          )}
        </div>

        {/* Billing History Section */}
        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Billing History</h2>
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#4b5563" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#4b5563" }}>Plan</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#4b5563" }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#4b5563" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {isActive ? (
                   <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "16px" }}>Mar 14, 2026</td>
                    <td style={{ padding: "16px" }}>{subscription.plan} (Early Adopter)</td>
                    <td style={{ padding: "16px" }}>PKR {isPremium ? "5,490" : isStandard ? "3,990" : "2,490"}</td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>Paid</span>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>
                      No billing history found for this clinic.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

