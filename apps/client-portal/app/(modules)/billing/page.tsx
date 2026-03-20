import { ClinicSelectorCard } from "../../../components/clinic-selector-card";
import { PortalLoginForm } from "../../../components/portal-login-form";
import { getPortalSession } from "../../../lib/auth";
import { getClinicBillingSummary } from "../../../lib/portal-billing";
import { PricingSection } from "../../../components/pricing-section";

export const dynamic = "force-dynamic";

function formatMoney(amount: number | null, currency: string) {
  if (amount == null) {
    return "TBD";
  }

  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatDate(value?: string | null) {
  if (!value) {
    return "TBD";
  }

  try {
    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function humanizeStatus(status?: string | null) {
  if (!status) {
    return "Unknown";
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(status?: string | null) {
  switch (status) {
    case "active":
    case "paid":
      return { background: "#dcfce7", color: "#166534", border: "#86efac" };
    case "trialing":
      return { background: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" };
    case "past_due":
    case "open":
      return { background: "#fef3c7", color: "#92400e", border: "#fcd34d" };
    case "canceled":
    case "unpaid":
    case "void":
      return { background: "#fee2e2", color: "#991b1b", border: "#fca5a5" };
    default:
      return { background: "#e5e7eb", color: "#374151", border: "#d1d5db" };
  }
}

const upgradeNotes: Record<string, string[]> = {
  basic: [
    "Move to Standard for secure patient record storage and daily clinic workflows.",
    "Move to Premium for AI assistance, predictive insights, and higher storage capacity."
  ],
  standard: [
    "Premium adds AI medical assistance and smarter document organization.",
    "Higher-tier support and more room for clinic growth are available through the billing portal."
  ],
  premium: [
    "Your clinic already has the full MediVault package.",
    "Use the billing portal to update payment methods, invoice details, or future plan changes."
  ],
  custom: [
    "Your plan is on a custom configuration.",
    "Use the billing portal for payment changes and contact NextWave if you need contract updates."
  ],
  unknown: [
    "Your subscription is active, but its catalog label needs cleanup in Stripe metadata.",
    "The portal is now reading the live subscription, so billing amounts and invoice history remain accurate."
  ]
};

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
          background: "linear-gradient(180deg, #ecf4f6 0%, #f6fbff 100%)"
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

  let billing = null;
  let billingError: string | null = null;

  try {
    billing = await getClinicBillingSummary(membership.clientId);
  } catch (error) {
    billingError = error instanceof Error ? error.message : "Unable to load live billing details right now.";
  }

  const isActive = billing ? ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(billing.status) : false;
  const planTone = statusTone(billing?.status ?? membership.subscription?.status ?? "inactive");
  const checkoutSuccess = resolvedSearchParams.checkout === "success";
  const portalError = resolvedSearchParams.portal === "error";
  const portalMessage = typeof resolvedSearchParams.message === "string" ? resolvedSearchParams.message : null;
  const upgradeItems = upgradeNotes[billing?.planKey ?? "unknown"];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #edf5f6 0%, #e7f1f1 42%, #f8fbfd 100%)",
        fontFamily: "ui-sans-serif, system-ui",
        color: "#0f172a"
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: 24, display: "grid", gap: 24 }}>
        <ClinicSelectorCard memberships={session.memberships} selectedClientId={session.selectedClientId} />

        <section
          style={{
            position: "sticky",
            top: 16,
            zIndex: 10,
            borderRadius: 28,
            overflow: "hidden",
            border: "1px solid rgba(15, 118, 110, 0.16)",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.1)",
            background: "linear-gradient(120deg, #123047 0%, #0f766e 54%, #d8f2ec 170%)"
          }}
        >
          <div
            style={{
              padding: 24,
              display: "grid",
              gap: 18,
              background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.76)", fontWeight: 700 }}>
                    Clinic Billing
                  </span>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: `1px solid ${planTone.border}`,
                      background: planTone.background,
                      color: planTone.color,
                      fontSize: 12,
                      fontWeight: 700
                    }}
                  >
                    {humanizeStatus(billing?.status ?? membership.subscription?.status ?? "inactive")}
                  </span>
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.05, color: "#ffffff", fontWeight: 800 }}>{membership.clinicName}</h1>
                  <p style={{ margin: "6px 0 0 0", color: "rgba(255,255,255,0.76)", fontSize: 14 }}>
                    Live billing workspace with operational controls for your clinic account.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a
                  href="/api/billing/manage"
                  style={{
                    textDecoration: "none",
                    padding: "12px 16px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.94)",
                    color: "#0f172a",
                    fontWeight: 700,
                    boxShadow: "0 10px 30px rgba(15,23,42,0.16)"
                  }}
                >
                  Manage Billing
                </a>
                <a
                  href="#upgrade-options"
                  style={{
                    textDecoration: "none",
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.24)",
                    color: "#ffffff",
                    fontWeight: 700,
                    background: "rgba(15,23,42,0.18)"
                  }}
                >
                  Review Options
                </a>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
              {[
                { label: "Current plan", value: billing?.planName ?? membership.subscription?.plan ?? "Billing sync pending" },
                { label: "Current cycle", value: billing ? formatMoney(billing.price, billing.currency) : "TBD" },
                { label: "Next renewal", value: billing ? formatDate(billing.nextBillingDate) : membership.subscription?.currentPeriodEnd ? formatDate(membership.subscription.currentPeriodEnd) : "TBD" },
                { label: "Billing role", value: membership.role }
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    backdropFilter: "blur(12px)"
                  }}
                >
                  <div style={{ color: "rgba(255,255,255,0.68)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{item.label}</div>
                  <div style={{ marginTop: 8, color: "#ffffff", fontSize: 20, fontWeight: 800 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gap: 16 }}>
          {checkoutSuccess ? (
            <div style={{ background: "#ecfdf5", color: "#065f46", padding: "14px 16px", borderRadius: 16, border: "1px solid #10b981", fontWeight: 600 }}>
              Payment completed successfully. The portal is now reading your live Stripe subscription, not the old placeholder label.
            </div>
          ) : null}
          {portalError ? (
            <div style={{ background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: 16, border: "1px solid #fca5a5", fontWeight: 600 }}>
              {portalMessage ?? "Unable to open the billing portal for this clinic right now."}
            </div>
          ) : null}
          {billingError ? (
            <div style={{ background: "#fff7ed", color: "#9a3412", padding: "14px 16px", borderRadius: 16, border: "1px solid #fdba74", fontWeight: 600 }}>
              Live billing details could not be loaded right now. The portal stayed online and your clinic access is intact. Error: {billingError}
            </div>
          ) : null}
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "start" }}>
          <section style={{ display: "grid", gap: 24 }}>
            <article style={{ background: "rgba(255,255,255,0.92)", borderRadius: 24, border: "1px solid #dbe4ea", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", overflow: "hidden" }}>
              <div style={{ padding: 24, borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Billing History</h2>
                  <p style={{ margin: "6px 0 0 0", color: "#475569", fontSize: 14 }}>
                    {billingError ? `Recent invoices are temporarily unavailable for ${membership.clinicName}.` : `Real invoice records for ${membership.clinicName}.`}
                  </p>
                </div>
                {billing?.invoices?.[0]?.hostedInvoiceUrl ? (
                  <a href={billing.invoices[0].hostedInvoiceUrl} target="_blank" rel="noreferrer" style={{ color: "#0f766e", fontWeight: 700, textDecoration: "none" }}>
                    Open latest invoice
                  </a>
                ) : null}
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", color: "#475569", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      <th style={{ textAlign: "left", padding: "14px 18px" }}>Date</th>
                      <th style={{ textAlign: "left", padding: "14px 18px" }}>Plan</th>
                      <th style={{ textAlign: "left", padding: "14px 18px" }}>Amount</th>
                      <th style={{ textAlign: "left", padding: "14px 18px" }}>Status</th>
                      <th style={{ textAlign: "left", padding: "14px 18px" }}>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billing?.invoices?.length ? (
                      billing.invoices.map((invoice) => {
                        const tone = statusTone(invoice.status);
                        return (
                          <tr key={invoice.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "16px 18px", color: "#0f172a", fontWeight: 600 }}>{formatDate(invoice.date)}</td>
                            <td style={{ padding: "16px 18px", color: "#334155" }}>{invoice.planName}</td>
                            <td style={{ padding: "16px 18px", color: "#0f172a", fontWeight: 700 }}>{formatMoney(invoice.amount, invoice.currency)}</td>
                            <td style={{ padding: "16px 18px" }}>
                              <span style={{ padding: "6px 10px", borderRadius: 999, border: `1px solid ${tone.border}`, background: tone.background, color: tone.color, fontSize: 12, fontWeight: 700 }}>
                                {humanizeStatus(invoice.status)}
                              </span>
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              {invoice.hostedInvoiceUrl || invoice.pdfUrl ? (
                                <a
                                  href={invoice.hostedInvoiceUrl ?? invoice.pdfUrl ?? "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: "#0f766e", fontWeight: 700, textDecoration: "none" }}
                                >
                                  View
                                </a>
                              ) : (
                                <span style={{ color: "#94a3b8" }}>Not available</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: 28, textAlign: "center", color: "#64748b" }}>
                          {billingError ? "Billing history is temporarily unavailable while live billing sync is being retried." : "No Stripe invoices found for this clinic yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            {!isActive ? (
              <article id="upgrade-options" style={{ background: "rgba(255,255,255,0.9)", borderRadius: 24, border: "1px solid #dbe4ea", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", overflow: "hidden" }}>
                <PricingSection />
              </article>
            ) : null}
          </section>

          <aside style={{ display: "grid", gap: 24 }}>
            <section style={{ background: "rgba(255,255,255,0.94)", borderRadius: 24, border: "1px solid #dbe4ea", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", padding: 24, display: "grid", gap: 18 }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0f766e", fontWeight: 800 }}>Subscription Console</p>
                <h2 style={{ margin: "8px 0 0 0", fontSize: 24, fontWeight: 800 }}>Your MediVault plan</h2>
              </div>

              <div style={{ padding: 18, borderRadius: 20, background: "linear-gradient(180deg, #f8fafc 0%, #eef6f5 100%)", border: "1px solid #dbe4ea", display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{billing?.planName ?? membership.subscription?.plan ?? "Billing sync pending"}</div>
                    <div style={{ marginTop: 4, color: "#475569", fontSize: 14 }}>
                      {billing?.cancelAtPeriodEnd ? "Cancels at the end of the current cycle." : "Billing remains active for the current clinic cycle."}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{billing ? formatMoney(billing.price, billing.currency) : "TBD"}</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>/ {billing?.interval ?? "month"}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    { label: "Next billing date", value: billing ? formatDate(billing.nextBillingDate) : membership.subscription?.currentPeriodEnd ? formatDate(membership.subscription.currentPeriodEnd) : "TBD" },
                    { label: "Trial end", value: billing?.trialEndsAt ? formatDate(billing.trialEndsAt) : "Not applicable" },
                    { label: "Billing reference", value: billing?.priceId ?? membership.subscription?.plan ?? "Awaiting Stripe sync" }
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
                      <span style={{ color: "#64748b" }}>{item.label}</span>
                      <span style={{ color: "#0f172a", fontWeight: 700, textAlign: "right" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <a href="/api/billing/manage" style={{ textDecoration: "none", textAlign: "center", padding: "14px 16px", borderRadius: 14, background: "#0f172a", color: "#ffffff", fontWeight: 800 }}>
                  Open Billing Portal
                </a>
                <p style={{ margin: 0, color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
                  Customers can update payment method, review invoices, and manage future subscription changes from the Stripe billing portal.
                </p>
              </div>
            </section>

            <section id="upgrade-options" style={{ background: "rgba(255,255,255,0.94)", borderRadius: 24, border: "1px solid #dbe4ea", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", padding: 24, display: "grid", gap: 16 }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0f766e", fontWeight: 800 }}>Growth Options</p>
                <h2 style={{ margin: "8px 0 0 0", fontSize: 24, fontWeight: 800 }}>Next cycle planning</h2>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {upgradeItems.map((item) => (
                  <div key={item} style={{ padding: 14, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", lineHeight: 1.55 }}>
                    {item}
                  </div>
                ))}
              </div>

              <div style={{ padding: 18, borderRadius: 20, background: "linear-gradient(135deg, #123047 0%, #0f766e 100%)", color: "#ffffff", display: "grid", gap: 10 }}>
                <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontWeight: 800 }}>
                  Recommended action
                </div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>
                  {billing?.planKey === "basic" ? "Upgrade to Standard" : billing?.planKey === "standard" ? "Review Premium" : "Keep billing current"}
                </div>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", lineHeight: 1.6 }}>
                  Use the billing portal for the next cycle if you want to change package, update the payment method, or keep invoices under your clinic finance workflow.
                </p>
                <a href="/api/billing/manage" style={{ width: "fit-content", textDecoration: "none", padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.96)", color: "#0f172a", fontWeight: 800 }}>
                  Manage Next Cycle
                </a>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
