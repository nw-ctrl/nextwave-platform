import { PortalLoginForm } from "../../../components/portal-login-form";
import { PortalTopBar } from "../../../components/portal-top-bar";
import { getPortalSession } from "../../../lib/auth";
import { getClinicBillingSummary, getReadablePortalPlanName } from "../../../lib/portal-billing";
import { PricingSection } from "../../../components/pricing-section";

export const dynamic = "force-dynamic";

const headingFont = 'Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif';
const bodyFont = 'Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif';

const workspaceActions = [
  "Visits",
  "Messages",
  "Appointments",
  "Reports",
  "Billing",
  "Settings"
];

const futureSpotlight = [
  "Telehealth join",
  "Consent tracking",
  "Lab requests",
  "Priority queue"
];

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
      return { background: "rgba(34, 214, 220, 0.14)", color: "#87f2f4", border: "rgba(34, 214, 220, 0.26)" };
    case "trialing":
      return { background: "rgba(108, 170, 255, 0.14)", color: "#bcd8ff", border: "rgba(108, 170, 255, 0.24)" };
    case "past_due":
    case "open":
      return { background: "rgba(255, 190, 92, 0.16)", color: "#ffd59c", border: "rgba(255, 190, 92, 0.26)" };
    case "canceled":
    case "unpaid":
    case "void":
      return { background: "rgba(255, 111, 111, 0.16)", color: "#ffc1c1", border: "rgba(255, 111, 111, 0.24)" };
    default:
      return { background: "rgba(255,255,255,0.08)", color: "#c1d3dc", border: "rgba(73, 103, 133, 0.32)" };
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
  background: "linear-gradient(180deg, rgba(21, 43, 69, 0.96) 0%, rgba(14, 31, 51, 0.96) 100%)",
  border: "1px solid rgba(60, 94, 125, 0.44)",
  boxShadow: "0 18px 38px rgba(8, 17, 30, 0.24)"
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
          background: "linear-gradient(180deg, #eef8fb 0%, #122846 100%)"
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
      <main style={{ padding: 24, fontFamily: bodyFont, minHeight: "100vh", background: "linear-gradient(180deg, #eef8fb 0%, #122846 100%)" }}>
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
  const hasDiscount = Boolean(billing?.discount) || (typeof billing?.basePrice === "number" && typeof billing?.price === "number" && billing.price < billing.basePrice);
  const lockedRateNote = billing?.discount?.isLifetime ? (billing.discount.isFounderOffer ? "Founder rate locked for every renewal" : "Recurring Stripe discount remains attached") : null;
  const billingNote = lockedRateNote ?? (hasDiscount ? "Discount currently applied" : null);
  const cyclePrice = billing?.price ?? null;
  const baseCyclePrice = billing?.basePrice ?? null;
  const monthlySavings = baseCyclePrice != null && cyclePrice != null && baseCyclePrice > cyclePrice ? baseCyclePrice - cyclePrice : null;
  const nextCycleLabel = cyclePrice != null ? formatMoney(cyclePrice, billing?.currency ?? "PKR") : "TBD";
  const paidCycles = invoices.filter((invoice) => invoice.status === "paid").length;
  const cumulativeSavingsToDate = monthlySavings != null ? monthlySavings * paidCycles : null;
  const cumulative12MonthSavings = monthlySavings != null ? monthlySavings * 12 : null;
  const savingsHighlight = cumulativeSavingsToDate != null && cumulativeSavingsToDate > 0 ? `${formatMoney(cumulativeSavingsToDate, billing?.currency ?? "PKR")} saved to date` : null;
  const savingsSubnote = monthlySavings != null
    ? `At your current founder rate, 12 months reaches ${formatMoney(cumulative12MonthSavings, billing?.currency ?? "PKR")} in total savings.`
    : null;

  return (
    <main className="portal-page">
      <PortalTopBar
        memberships={session.memberships}
        selectedClientId={session.selectedClientId}
        clinicName={membership.clinicName}
        planName={planName}
        billingStatus={billingStatus}
        nextBillingDate={formatDate(nextBillingDate)}
        billingNote={billingNote}
        savingsHighlight={savingsHighlight}
        savingsSubnote={savingsSubnote}
        nextCycleAmount={nextCycleLabel}
      />

      <div className="portal-content-wrap">
        {checkoutSuccess ? (
          <div className="portal-alert success">Payment completed successfully.</div>
        ) : null}

        {portalError ? (
          <div className="portal-alert error">
            {portalMessage ?? "Unable to open the billing portal for this clinic right now."}
          </div>
        ) : null}

        {billingError ? (
          <div className="portal-alert warning">
            Live billing sync is temporarily unavailable. The portal is still usable and your clinic access is intact.
            {billingError ? ` (${billingError})` : ""}
          </div>
        ) : null}

        <section className="portal-summary-grid">
          <article className="portal-card" style={{ ...shellSurface }}>
            <div className="portal-card-heading">
              <span>Current Plan</span>
              <span
                className="portal-plan-chip"
                style={{ background: planTone.background, color: planTone.color, borderColor: planTone.border }}
              >
                {billingStatus}
              </span>
            </div>
            <div>
              <div className="portal-card-title">{planName}</div>
              <p className="portal-card-sub">{slimNotes[0]}</p>
            </div>
          </article>

          <article className="portal-card" style={{ ...shellSurface }}>
            <div className="portal-card-heading">
              <span>Next Cycle</span>
            </div>
            <div className="portal-card-value">
              <span className="portal-cycle-price">{nextCycleLabel}</span>
              {hasDiscount && baseCyclePrice != null && cyclePrice != null && baseCyclePrice > cyclePrice ? (
                <div className="portal-card-strikethrough">
                  <span className="portal-card-previous">{formatMoney(baseCyclePrice, billing?.currency ?? "PKR")}</span>
                  <span className="portal-card-discount">{billing?.discount?.label ?? "Discounted renewal"}</span>
                </div>
              ) : null}
            </div>
            <div className="portal-card-meta">
              <span>Renews {formatDate(nextBillingDate)}</span>
              {monthlySavings ? (
                <span>You save {formatMoney(monthlySavings, billing?.currency ?? "PKR")} each cycle.</span>
              ) : null}
            </div>
          </article>

          <article className="portal-card" style={{ ...shellSurface }}>
            <div className="portal-card-heading">
              <span>{lockedRateNote ? "Founder Advantage" : "Plan Notes"}</span>
            </div>
            <p className="portal-card-note">{lockedRateNote ?? slimNotes[1]}</p>
            {savingsHighlight ? (
              <div className="portal-card-cumulative">
                <strong>{savingsHighlight}</strong>
                {savingsSubnote ? <span className="portal-card-note-sub">{savingsSubnote}</span> : null}
              </div>
            ) : null}
          </article>
        </section>

        <section className="portal-history-card" style={{ ...shellSurface }}>
          <div className="portal-history-header">
            <div>
              <h2>Billing History</h2>
              <p>
                {invoices.length
                  ? "Recent posted invoices from Stripe."
                  : "Invoices will appear here after Stripe posts them to the clinic account."}
              </p>
            </div>
            {invoices[0]?.hostedInvoiceUrl ? (
              <a href={invoices[0].hostedInvoiceUrl} target="_blank" rel="noreferrer">
                Latest invoice
              </a>
            ) : null}
          </div>
          <div className="portal-history-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length ? (
                  invoices.map((invoice) => {
                    const tone = statusTone(invoice.status);
                    return (
                      <tr key={invoice.id}>
                        <td>{formatDate(invoice.date)}</td>
                        <td>{invoice.planName}</td>
                        <td>{formatMoney(invoice.amount, invoice.currency)}</td>
                        <td>
                          <span
                            className="portal-history-badge"
                            style={{ borderColor: tone.border, background: tone.background, color: tone.color }}
                          >
                            {humanizeStatus(invoice.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4}>No invoice entries available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="portal-history-mobile">
            {invoices.length ? (
              invoices.map((invoice) => {
                const tone = statusTone(invoice.status);
                return (
                  <article key={invoice.id}>
                    <div className="portal-history-mobile-row">
                      <span>{formatDate(invoice.date)}</span>
                      <span
                        className="portal-history-badge"
                        style={{ borderColor: tone.border, background: tone.background, color: tone.color }}
                      >
                        {humanizeStatus(invoice.status)}
                      </span>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <div>{invoice.planName}</div>
                      <div>{formatMoney(invoice.amount, invoice.currency)}</div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="portal-history-empty">No invoice entries available yet.</div>
            )}
          </div>
        </section>

        <section className="portal-info-grid">
          <div className="portal-info-column" style={{ ...shellSurface }}>
            <div className="portal-info-head">
              <span>Clinic operations</span>
              <p>These tools are ready whenever your team needs them.</p>
            </div>
            <div className="portal-info-actions">
              {workspaceActions.map((label) => (
                <button key={label} type="button" className="portal-info-chip">
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="portal-info-column" style={{ ...shellSurface }}>
            <div className="portal-info-head">
              <span>Future modules</span>
              <p>Slide new capabilities into this workspace as your clinic grows.</p>
            </div>
            <div className="portal-feature-list">
              {futureSpotlight.map((feature) => (
                <div key={feature} className="portal-feature-item">
                  <span className="portal-feature-dot" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className="portal-info-late-note">
              <span>Next cycle amount {nextCycleLabel}</span>
              <a href="/api/billing/manage">Manage billing & upgrades</a>
            </div>
          </div>
        </section>

        {isActive ? (
          <section className="portal-upgrade-note" style={{ ...shellSurface }}>
            <div className="portal-info-head">
              <span>Upgrade or adjust</span>
            </div>
            <div style={{ fontSize: 14, color: "#e7f6fb", lineHeight: 1.6 }}>
              {billing?.discount
                ? `${billing.discount.label}${billing.discount.isLifetime ? " is attached to the subscription in Stripe and should continue on future renewals." : " is currently applied to this subscription."}`
                : "For plan changes or failed payments, start with Manage Billing. That keeps the clinic subscription accurate while preserving your current access."}
            </div>
            <a href="/api/billing/manage">Review change options</a>
          </section>
        ) : (
          <section className="portal-pricing-wrapper">
            <PricingSection />
          </section>
        )}
      </div>

      <style>{`
        .portal-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 12% 10%, rgba(34, 214, 220, 0.1), transparent 18%),
            radial-gradient(circle at 86% 12%, rgba(79, 146, 209, 0.18), transparent 18%),
            linear-gradient(180deg, #11253e 0%, #0d1f34 54%, #102641 100%);
          font-family: ${bodyFont};
          color: #e7f6fb;
        }

        .portal-content-wrap {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 20px 40px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .portal-alert {
          border-radius: 18px;
          padding: 14px 18px;
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.04);
        }

        .portal-alert.success {
          border-color: rgba(29, 213, 217, 0.6);
          color: #cceefe;
        }

        .portal-alert.warning {
          border-color: rgba(251, 191, 36, 0.6);
          color: #fff7d6;
        }

        .portal-alert.error {
          border-color: rgba(251, 113, 133, 0.6);
          color: #ffe2e5;
        }

        .portal-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .portal-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .portal-card-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
        }

        .portal-plan-chip {
          padding: 5px 14px;
          border-radius: 999px;
          border: 1px solid;
          font-size: 11px;
          letter-spacing: 0.1em;
        }

        .portal-card-title {
          font-size: 24px;
          font-weight: 700;
          font-family: ${headingFont};
          margin: 0;
        }

        .portal-card-sub {
          margin: 0;
          color: rgba(255, 255, 255, 0.68);
          line-height: 1.6;
          font-size: 14px;
        }

        .portal-card-value {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .portal-cycle-price {
          font-size: 36px;
          font-weight: 700;
          font-family: ${headingFont};
        }

        .portal-card-strikethrough {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.75);
        }

        .portal-card-previous {
          text-decoration: line-through;
          opacity: 0.7;
        }

        .portal-card-discount {
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(29, 213, 217, 0.18);
          border: 1px solid rgba(29, 213, 217, 0.3);
          color: #87f2f4;
        }

        .portal-card-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.65);
        }

        .portal-card-note {
          margin: 0;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.6;
        }

        .portal-card-cumulative {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.88);
        }

        .portal-card-note-sub {
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
        }

        .portal-history-card {
          padding: 26px;
          border-radius: 26px;
        }

        .portal-history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          gap: 12px;
        }

        .portal-history-header h2 {
          margin: 0;
          font-size: 22px;
        }

        .portal-history-header p {
          margin: 4px 0 0;
          color: rgba(255, 255, 255, 0.72);
          font-size: 13px;
        }

        .portal-history-header a {
          color: #87f2f4;
          font-weight: 600;
          text-decoration: none;
          font-size: 13px;
        }

        .portal-history-table table {
          width: 100%;
          border-collapse: collapse;
          min-width: 540px;
        }

        .portal-history-table th,
        .portal-history-table td {
          padding: 12px 18px;
          text-align: left;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.75);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .portal-history-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }

        .portal-history-mobile {
          display: none;
          margin-top: 16px;
          gap: 12px;
          flex-direction: column;
        }

        .portal-history-mobile article {
          padding: 14px 16px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .portal-history-mobile-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .portal-history-empty {
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
        }

        .portal-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .portal-info-column {
          padding: 24px;
          border-radius: 26px;
        }

        .portal-info-head span {
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
        }

        .portal-info-head p {
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
          font-size: 14px;
          line-height: 1.5;
        }

        .portal-info-actions {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .portal-info-chip {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: #e7f6fb;
          font-size: 13px;
          cursor: pointer;
        }

        .portal-feature-list {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .portal-feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255, 255, 255, 0.78);
          font-size: 14px;
        }

        .portal-feature-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #34d399;
        }

        .portal-info-late-note {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .portal-info-late-note a {
          color: #87f2f4;
          text-decoration: none;
          font-weight: 600;
        }

        .portal-upgrade-note {
          padding: 24px;
          border-radius: 26px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .portal-upgrade-note a {
          color: #87f2f4;
          font-weight: 600;
          text-decoration: none;
        }

        .portal-pricing-wrapper {
          border-radius: 28px;
          overflow: hidden;
          margin-top: 10px;
        }

        @media (max-width: 980px) {
          .portal-history-table table {
            min-width: 100%;
          }
        }

        @media (max-width: 760px) {
          .portal-history-table {
            display: none;
          }

          .portal-history-mobile {
            display: flex;
          }
        }
      `}</style>
    </main>
  );
}
