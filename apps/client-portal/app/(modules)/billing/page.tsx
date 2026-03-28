import { PortalLoginForm } from "../../../components/portal-login-form";
import { PortalTopBar } from "../../../components/portal-top-bar";
import { getPortalSession } from "../../../lib/auth";
import { getClinicBillingSummary, getReadablePortalPlanName } from "../../../lib/portal-billing";
import { PricingSection } from "../../../components/pricing-section";

export const dynamic = "force-dynamic";

const headingFont = 'Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif';
const bodyFont = 'Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif';

const accountChecklist = [
  "Plan status",
  "Renewal date",
  "Invoice history",
  "Billing settings"
];

function formatMoney(amount: number | null, currency: string) {
  if (amount == null) {
    return "Available in your account";
  }

  try {
    return new Intl.NumberFormat("en-AU", {
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
    return "Available in your account";
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
    return "Not available";
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
      return { background: "#ecfdf5", color: "#166534", border: "#bbf7d0" };
    case "trialing":
      return { background: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
    case "past_due":
    case "open":
      return { background: "#fff7ed", color: "#9a3412", border: "#fed7aa" };
    case "canceled":
    case "unpaid":
    case "void":
      return { background: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
    default:
      return { background: "#f8fafc", color: "#334155", border: "#e2e8f0" };
  }
}

const planFeatureNotes: Record<string, string[]> = {
  basic: ["Your clinic is on the Basic plan.", "You can review or change plan settings from the billing area."],
  standard: ["Your clinic is on the Standard plan.", "This plan supports routine day-to-day clinic operations."],
  premium: ["Your clinic is on the Premium plan.", "This plan includes the broadest level of access currently available."],
  custom: ["Your clinic is on a custom plan.", "For plan adjustments, use billing settings or contact support."],
  unknown: ["Plan details are being refreshed.", "Your account remains active while billing information loads."]
};

const shellSurface = {
  background: "#ffffff",
  border: "1px solid #dbe3ea",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)"
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
          background: "linear-gradient(180deg, #f6f8fb 0%, #eef2f6 100%)"
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
      <main style={{ padding: 24, fontFamily: bodyFont, minHeight: "100vh", background: "linear-gradient(180deg, #f6f8fb 0%, #eef2f6 100%)" }}>
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
    billingError = error instanceof Error ? error.message : "Unable to load billing details right now.";
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
  const accountNote = hasDiscount ? "A pricing adjustment is currently applied to this account." : null;
  const cyclePrice = billing?.price ?? null;
  const baseCyclePrice = billing?.basePrice ?? null;
  const monthlySavings = baseCyclePrice != null && cyclePrice != null && baseCyclePrice > cyclePrice ? baseCyclePrice - cyclePrice : null;
  const currency = billing?.currency ?? "PKR";
  const nextCycleLabel = formatMoney(cyclePrice, currency);

  return (
    <main className="portal-page">
      <PortalTopBar
        memberships={session.memberships}
        selectedClientId={session.selectedClientId}
        clinicName={membership.clinicName}
        planName={planName}
        billingStatus={billingStatus}
        nextBillingDate={formatDate(nextBillingDate)}
        billingNote={accountNote}
        savingsHighlight={monthlySavings ? `${formatMoney(monthlySavings, currency)} below the standard rate` : null}
        savingsSubnote={monthlySavings ? "Current account pricing is lower than the standard subscription amount." : null}
        nextCycleAmount={nextCycleLabel}
      />

      <div className="portal-content-wrap">
        {checkoutSuccess ? <div className="portal-alert success">Payment completed successfully.</div> : null}

        {portalError ? <div className="portal-alert error">{portalMessage ?? "Unable to open billing settings for this clinic right now."}</div> : null}

        {billingError ? (
          <div className="portal-alert warning">
            Live billing information is temporarily unavailable. Your clinic account remains active.
            {billingError ? ` (${billingError})` : ""}
          </div>
        ) : null}

        <section className="portal-summary-grid">
          <article className="portal-card" style={{ ...shellSurface }}>
            <div className="portal-card-heading">
              <span>Current plan</span>
              <span className="portal-plan-chip" style={{ background: planTone.background, color: planTone.color, borderColor: planTone.border }}>
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
              <span>Next billing cycle</span>
            </div>
            <div className="portal-card-value">
              <span className="portal-cycle-price">{nextCycleLabel}</span>
              {hasDiscount && baseCyclePrice != null && cyclePrice != null && baseCyclePrice > cyclePrice ? (
                <div className="portal-card-strikethrough">
                  <span className="portal-card-previous">{formatMoney(baseCyclePrice, currency)}</span>
                  <span className="portal-card-discount">Adjusted pricing</span>
                </div>
              ) : null}
            </div>
            <div className="portal-card-meta">
              <span>Renews {formatDate(nextBillingDate)}</span>
              {monthlySavings ? <span>Current pricing is below the standard amount for this plan.</span> : null}
            </div>
          </article>

          <article className="portal-card" style={{ ...shellSurface }}>
            <div className="portal-card-heading">
              <span>Account note</span>
            </div>
            <p className="portal-card-note">{accountNote ?? slimNotes[1]}</p>
            <div className="portal-checklist">
              {accountChecklist.map((item) => (
                <div key={item} className="portal-checklist-item">
                  <span className="portal-checklist-dot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="portal-history-card" style={{ ...shellSurface }}>
          <div className="portal-history-header">
            <div>
              <h2>Billing history</h2>
              <p>{invoices.length ? "Recent invoices for this clinic account." : "Invoices will appear here once they are available for this clinic account."}</p>
            </div>
            <div className="portal-history-actions">
              <a href="/api/billing/manage">Open billing settings</a>
              {invoices[0]?.hostedInvoiceUrl ? (
                <a href={invoices[0].hostedInvoiceUrl} target="_blank" rel="noreferrer">
                  View latest invoice
                </a>
              ) : null}
            </div>
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
                          <span className="portal-history-badge" style={{ borderColor: tone.border, background: tone.background, color: tone.color }}>
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
                      <span className="portal-history-badge" style={{ borderColor: tone.border, background: tone.background, color: tone.color }}>
                        {humanizeStatus(invoice.status)}
                      </span>
                    </div>
                    <div className="portal-history-mobile-copy">
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

        {isActive ? null : (
          <section className="portal-pricing-wrapper">
            <PricingSection />
          </section>
        )}
      </div>

      <style>{`
        .portal-page { min-height: 100vh; background: linear-gradient(180deg, #f7f9fb 0%, #eef2f6 100%); font-family: ${bodyFont}; color: #0f172a; }
        .portal-content-wrap { max-width: 1240px; margin: 0 auto; padding: 24px 20px 40px; display: flex; flex-direction: column; gap: 18px; }
        .portal-alert { border-radius: 18px; padding: 14px 18px; font-size: 14px; border: 1px solid #dbe3ea; background: #ffffff; color: #334155; }
        .portal-alert.success { border-color: #99f6e4; color: #0f766e; }
        .portal-alert.warning { border-color: #fde68a; color: #92400e; }
        .portal-alert.error { border-color: #fecaca; color: #b91c1c; }
        .portal-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        .portal-card { display: flex; flex-direction: column; gap: 12px; padding: 22px; border-radius: 24px; }
        .portal-card-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #64748b; }
        .portal-plan-chip { padding: 5px 14px; border-radius: 999px; border: 1px solid; font-size: 11px; letter-spacing: 0.08em; }
        .portal-card-title { font-size: 24px; font-weight: 700; font-family: ${headingFont}; margin: 0; color: #0f172a; overflow-wrap: anywhere; }
        .portal-card-sub { margin: 0; color: #475569; line-height: 1.6; font-size: 14px; }
        .portal-card-value { display: flex; flex-direction: column; gap: 12px; }
        .portal-cycle-price { font-size: clamp(28px, 4vw, 36px); font-weight: 700; font-family: ${headingFont}; color: #0f172a; overflow-wrap: anywhere; }
        .portal-card-strikethrough { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 13px; color: #475569; }
        .portal-card-previous { text-decoration: line-through; opacity: 0.75; overflow-wrap: anywhere; }
        .portal-card-discount { padding: 4px 10px; border-radius: 999px; background: #ecfeff; border: 1px solid #bae6fd; color: #0f766e; }
        .portal-card-meta { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #64748b; overflow-wrap: anywhere; }
        .portal-card-note { margin: 0; color: #334155; line-height: 1.6; }
        .portal-checklist { display: grid; gap: 10px; margin-top: 4px; }
        .portal-checklist-item { display: flex; align-items: center; gap: 10px; color: #334155; font-size: 14px; }
        .portal-checklist-dot { width: 8px; height: 8px; border-radius: 999px; background: #0f766e; flex: 0 0 auto; }
        .portal-history-card { padding: 26px; border-radius: 26px; }
        .portal-history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 12px; }
        .portal-history-header h2 { margin: 0; font-size: 22px; color: #0f172a; }
        .portal-history-header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
        .portal-history-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .portal-history-actions a { color: #0f766e; font-weight: 600; text-decoration: none; font-size: 13px; }
        .portal-history-table { overflow-x: auto; }
        .portal-history-table table { width: 100%; border-collapse: collapse; min-width: 540px; }
        .portal-history-table th, .portal-history-table td { padding: 12px 18px; text-align: left; font-size: 13px; color: #475569; border-top: 1px solid #e2e8f0; }
        .portal-history-table th { color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; }
        .portal-history-badge { display: inline-flex; align-items: center; justify-content: center; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; border: 1px solid; }
        .portal-history-mobile { display: none; margin-top: 16px; gap: 12px; flex-direction: column; }
        .portal-history-mobile article { padding: 14px 16px; border-radius: 18px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px; }
        .portal-history-mobile-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .portal-history-mobile-copy { color: #334155; display: grid; gap: 4px; overflow-wrap: anywhere; }
        .portal-history-empty { text-align: center; color: #64748b; font-size: 13px; }
        .portal-pricing-wrapper { border-radius: 28px; overflow: hidden; margin-top: 10px; }
        @media (max-width: 760px) {
          .portal-content-wrap { padding: 18px 14px 32px; }
          .portal-history-header { flex-direction: column; align-items: flex-start; }
          .portal-history-table { display: none; }
          .portal-history-mobile { display: flex; }
        }
      `}</style>
    </main>
  );
}
