import { PortalLoginForm } from "../../../components/portal-login-form";
import { PortalTopBar } from "../../../components/portal-top-bar";
import { getPortalSession } from "../../../lib/auth";
import { getClinicBillingSummary, getReadablePortalPlanName } from "../../../lib/portal-billing";
import { PricingSection } from "../../../components/pricing-section";

export const dynamic = "force-dynamic";

const headingFont = 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif';
const bodyFont = 'Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif';

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
      return { background: "rgba(225, 239, 228, 0.72)", color: "#55635a", border: "rgba(154, 180, 159, 0.5)" };
    case "trialing":
      return { background: "rgba(226, 235, 242, 0.72)", color: "#55606b", border: "rgba(171, 185, 198, 0.5)" };
    case "past_due":
    case "open":
      return { background: "rgba(246, 233, 214, 0.82)", color: "#7c6548", border: "rgba(216, 181, 138, 0.6)" };
    case "canceled":
    case "unpaid":
    case "void":
      return { background: "rgba(245, 226, 226, 0.86)", color: "#8b5f5f", border: "rgba(220, 181, 181, 0.6)" };
    default:
      return { background: "rgba(234, 231, 228, 0.86)", color: "#6f665d", border: "rgba(201, 193, 184, 0.6)" };
  }
}

const planFeatureNotes: Record<string, string[]> = {
  basic: ["Platform access is active.", "Upgrade later when your clinic needs deeper records and workflow tools."],
  standard: ["Best fit for routine clinic operations.", "Premium remains available if you want AI assistance and higher capacity."],
  premium: ["Your clinic is on the highest MediVault tier.", "Use billing controls for payment method, invoices, and future cycle changes."],
  custom: ["Your clinic is on a custom plan configuration.", "Use the billing portal for payment controls and contact NextWave for contract changes."],
  unknown: ["Live plan data is being normalized.", "Your clinic access remains active while billing labels are cleaned up."]
};

const shellSurface = {
  background: "rgba(255,255,255,0.34)",
  border: "1px solid rgba(255,255,255,0.48)",
  boxShadow: "0 18px 42px rgba(95, 84, 71, 0.06)",
  backdropFilter: "blur(22px)"
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
          fontFamily: bodyFont,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #efe9df 0%, #f5f0e8 100%)"
        }}
      >
        <PortalLoginForm />
      </main>
    );
  }

  if (session.memberships.length === 0) {
    return (
      <main style={{ padding: 24, fontFamily: bodyFont }}>
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
      <main style={{ padding: 24, fontFamily: bodyFont, minHeight: "100vh", background: "linear-gradient(180deg, #efe9df 0%, #f5f0e8 100%)" }}>
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

  const invoices = billing?.invoices ?? [];
  const fallbackPlanName = getReadablePortalPlanName(membership.subscription?.plan);
  const planName = billing?.planName ?? fallbackPlanName;
  const billingStatus = humanizeStatus(billing?.status ?? membership.subscription?.status ?? "inactive");
  const nextBillingDate = billing?.nextBillingDate ?? membership.subscription?.currentPeriodEnd ?? null;
  const planTone = statusTone(billing?.status ?? membership.subscription?.status ?? "inactive");
  const checkoutSuccess = resolvedSearchParams.checkout === "success";
  const portalError = resolvedSearchParams.portal === "error";
  const portalMessage = typeof resolvedSearchParams.message === "string" ? resolvedSearchParams.message : null;
  const isActive = billing ? ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(billing.status) : false;
  const slimNotes = planFeatureNotes[billing?.planKey ?? "unknown"];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(111, 174, 178, 0.12), transparent 18%), radial-gradient(circle at 82% 28%, rgba(243, 218, 181, 0.16), transparent 18%), linear-gradient(180deg, #efe9df 0%, #f5f0e8 100%)",
        fontFamily: bodyFont,
        color: "#3d3731"
      }}
    >
      <PortalTopBar
        memberships={session.memberships}
        selectedClientId={session.selectedClientId}
        clinicName={membership.clinicName}
        planName={planName}
        billingStatus={billingStatus}
        nextBillingDate={formatDate(nextBillingDate)}
      />

      <div className="portal-page-wrap" style={{ maxWidth: 1240, margin: "0 auto", padding: "24px 20px 40px 20px", display: "grid", gap: 18 }}>
        {checkoutSuccess ? (
          <div style={{ ...shellSurface, padding: "14px 16px", color: "#5e6f63", borderRadius: 18 }}>
            Payment completed successfully.
          </div>
        ) : null}

        {portalError ? (
          <div style={{ ...shellSurface, padding: "14px 16px", color: "#8b5f5f", borderRadius: 18 }}>
            {portalMessage ?? "Unable to open the billing portal for this clinic right now."}
          </div>
        ) : null}

        {billingError ? (
          <div style={{ ...shellSurface, padding: "14px 16px", color: "#7b6549", borderRadius: 18 }}>
            Live billing sync is temporarily unavailable. The portal is still usable and your clinic access is intact.
          </div>
        ) : null}

        <section
          className="portal-summary-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14
          }}
        >
          <article style={{ ...shellSurface, padding: 22, borderRadius: 26 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(92, 84, 74, 0.44)" }}>Current Plan</div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 32, color: "#3e3832", fontFamily: headingFont }}>{planName}</div>
              <span style={{ padding: "6px 10px", borderRadius: 999, border: `1px solid ${planTone.border}`, background: planTone.background, color: planTone.color, fontSize: 12, fontWeight: 500 }}>
                {billingStatus}
              </span>
            </div>
            <div style={{ marginTop: 12, color: "rgba(92, 84, 74, 0.56)", fontSize: 14, lineHeight: 1.6 }}>{slimNotes[0]}</div>
          </article>

          <article style={{ ...shellSurface, padding: 22, borderRadius: 26 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(92, 84, 74, 0.44)" }}>Cycle</div>
            <div style={{ marginTop: 12, fontSize: 32, color: "#3e3832", fontFamily: headingFont }}>{billing ? formatMoney(billing.price, billing.currency) : "TBD"}</div>
            <div style={{ marginTop: 12, color: "rgba(92, 84, 74, 0.56)", fontSize: 14 }}>Next billing: {formatDate(nextBillingDate)}</div>
          </article>

          <article style={{ ...shellSurface, padding: 22, borderRadius: 26 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(92, 84, 74, 0.44)" }}>Next Step</div>
            <div style={{ marginTop: 12, fontSize: 18, color: "#4a433c", lineHeight: 1.5 }}>{slimNotes[1]}</div>
            <div style={{ marginTop: 16 }}>
              <a href="/api/billing/manage" style={{ textDecoration: "none", padding: "10px 14px", borderRadius: 14, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", color: "#3e3832", fontWeight: 500, display: "inline-block" }}>
                Open Billing Controls
              </a>
            </div>
          </article>
        </section>

        <div className="portal-content-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(280px, 0.7fr)", gap: 18, alignItems: "start" }}>
          <section style={{ display: "grid", gap: 18 }}>
            <article style={{ ...shellSurface, borderRadius: 28, overflow: "hidden" }}>
              <div style={{ padding: 22, borderBottom: "1px solid rgba(146, 140, 130, 0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 28, color: "#3e3832", fontFamily: headingFont, fontWeight: 400 }}>Billing History</h2>
                  <p style={{ margin: "6px 0 0 0", color: "rgba(92, 84, 74, 0.56)", fontSize: 14 }}>
                    {invoices.length ? "Recent posted invoices from Stripe." : "Invoices will appear here after Stripe posts them to the clinic account."}
                  </p>
                </div>
                {invoices[0]?.hostedInvoiceUrl ? (
                  <a href={invoices[0].hostedInvoiceUrl} target="_blank" rel="noreferrer" style={{ color: "rgba(74, 67, 60, 0.7)", fontWeight: 500, textDecoration: "none" }}>
                    Latest invoice
                  </a>
                ) : null}
              </div>

              <div className="portal-history-table" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
                  <thead>
                    <tr style={{ color: "rgba(92, 84, 74, 0.44)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      <th style={{ textAlign: "left", padding: "14px 18px" }}>Date</th>
                      <th style={{ textAlign: "left", padding: "14px 18px" }}>Plan</th>
                      <th style={{ textAlign: "left", padding: "14px 18px" }}>Amount</th>
                      <th style={{ textAlign: "left", padding: "14px 18px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length ? (
                      invoices.map((invoice) => {
                        const tone = statusTone(invoice.status);
                        return (
                          <tr key={invoice.id} style={{ borderTop: "1px solid rgba(146, 140, 130, 0.12)" }}>
                            <td style={{ padding: "16px 18px", color: "#4a433c", fontWeight: 500 }}>{formatDate(invoice.date)}</td>
                            <td style={{ padding: "16px 18px", color: "rgba(92, 84, 74, 0.72)" }}>{invoice.planName}</td>
                            <td style={{ padding: "16px 18px", color: "#4a433c", fontWeight: 500 }}>{formatMoney(invoice.amount, invoice.currency)}</td>
                            <td style={{ padding: "16px 18px" }}>
                              <span style={{ padding: "6px 10px", borderRadius: 999, border: `1px solid ${tone.border}`, background: tone.background, color: tone.color, fontSize: 12, fontWeight: 500 }}>
                                {humanizeStatus(invoice.status)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: 30, textAlign: "center", color: "rgba(92, 84, 74, 0.56)" }}>
                          No invoice entries available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="portal-history-mobile" style={{ display: "none", padding: 18 }}>
                {invoices.length ? (
                  invoices.map((invoice) => {
                    const tone = statusTone(invoice.status);
                    return (
                      <article key={invoice.id} style={{ padding: 16, borderRadius: 20, background: "rgba(255,255,255,0.28)", border: "1px solid rgba(255,255,255,0.42)", display: "grid", gap: 10, marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                          <div style={{ color: "#4a433c", fontWeight: 500 }}>{formatDate(invoice.date)}</div>
                          <span style={{ padding: "6px 10px", borderRadius: 999, border: `1px solid ${tone.border}`, background: tone.background, color: tone.color, fontSize: 12, fontWeight: 500 }}>
                            {humanizeStatus(invoice.status)}
                          </span>
                        </div>
                        <div style={{ color: "rgba(92, 84, 74, 0.72)" }}>{invoice.planName}</div>
                        <div style={{ color: "#4a433c", fontWeight: 500 }}>{formatMoney(invoice.amount, invoice.currency)}</div>
                      </article>
                    );
                  })
                ) : (
                  <div style={{ color: "rgba(92, 84, 74, 0.56)", textAlign: "center", padding: "10px 0 4px 0" }}>No invoice entries available yet.</div>
                )}
              </div>
            </article>
          </section>

          <aside className="portal-sidebar" style={{ display: "grid", gap: 18 }}>
            <section style={{ ...shellSurface, borderRadius: 28, padding: 22, display: "grid", gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(92, 84, 74, 0.44)" }}>Plan Summary</div>
                <div style={{ marginTop: 8, fontSize: 28, color: "#3e3832", fontFamily: headingFont }}>{planName}</div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
                  <span style={{ color: "rgba(92, 84, 74, 0.56)" }}>Status</span>
                  <span style={{ color: "#4a433c", fontWeight: 500 }}>{billingStatus}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
                  <span style={{ color: "rgba(92, 84, 74, 0.56)" }}>Next billing</span>
                  <span style={{ color: "#4a433c", fontWeight: 500 }}>{formatDate(nextBillingDate)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
                  <span style={{ color: "rgba(92, 84, 74, 0.56)" }}>Cycle price</span>
                  <span style={{ color: "#4a433c", fontWeight: 500 }}>{billing ? formatMoney(billing.price, billing.currency) : "TBD"}</span>
                </div>
              </div>
            </section>

            <section style={{ ...shellSurface, borderRadius: 28, padding: 22, display: "grid", gap: 12 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(92, 84, 74, 0.44)" }}>What You Can Do Here</div>
              <div style={{ color: "#4a433c", lineHeight: 1.6 }}>Update payment details, download invoices, and manage the next subscription cycle without contacting support.</div>
              <div style={{ color: "rgba(92, 84, 74, 0.56)", fontSize: 14, lineHeight: 1.6 }}>For plan changes or failed payments, start with Manage Billing. That keeps the clinic subscription accurate while preserving your current access.</div>
            </section>

            {!isActive ? (
              <section id="upgrade-options" style={{ ...shellSurface, borderRadius: 28, overflow: "hidden" }}>
                <PricingSection />
              </section>
            ) : (
              <section id="upgrade-options" style={{ ...shellSurface, borderRadius: 28, padding: 22, display: "grid", gap: 12 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(92, 84, 74, 0.44)" }}>Future Upgrade</div>
                <div style={{ fontSize: 16, color: "#4a433c", lineHeight: 1.6 }}>{slimNotes[1]}</div>
                <a href="/api/billing/manage" style={{ textDecoration: "none", width: "fit-content", padding: "10px 14px", borderRadius: 14, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", color: "#4a433c", fontWeight: 500 }}>
                  Review change options
                </a>
              </section>
            )}
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .portal-content-grid {
            grid-template-columns: 1fr !important;
          }

          .portal-sidebar {
            order: -1;
          }
        }

        @media (max-width: 720px) {
          .portal-page-wrap {
            padding: 18px 14px 28px 14px !important;
          }

          .portal-summary-grid {
            grid-template-columns: 1fr !important;
          }

          .portal-history-table {
            display: none !important;
          }

          .portal-history-mobile {
            display: block !important;
          }
        }
      `}</style>
    </main>
  );
}
