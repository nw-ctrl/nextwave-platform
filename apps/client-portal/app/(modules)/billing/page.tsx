import { ArrowUpRight, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { PricingSection } from "@/components/pricing-section";
import { getPortalSession } from "@/lib/auth";
import { getClinicBillingSummary, getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

const accountChecklist = ["Plan status", "Renewal date", "Invoice history", "Billing settings"];

function formatMoney(amount: number | null, currency: string) {
  if (amount == null) return "Available in your account";
  try {
    return new Intl.NumberFormat("en-AU", { style: "currency", currency, maximumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatDate(value?: string | null) {
  if (!value) return "Available in your account";
  try {
    return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

function humanizeStatus(status?: string | null) {
  if (!status) return "Not available";
  return status.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function statusTone(status?: string | null) {
  switch (status) {
    case "active":
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "trialing":
      return "bg-sky-100 text-sky-700";
    case "past_due":
    case "open":
      return "bg-amber-100 text-amber-700";
    case "canceled":
    case "unpaid":
    case "void":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

const planFeatureNotes: Record<string, string[]> = {
  basic: ["Your clinic is on Essential Care.", "You can review or change plan settings from the billing area."],
  standard: ["Your clinic is on Advanced Practice.", "This plan supports routine day-to-day clinic operations."],
  premium: ["Your clinic is on Total Wellness.", "This plan includes the broadest level of access currently available."],
  custom: ["Your clinic is on a custom plan.", "For plan adjustments, use billing settings or contact support."],
  unknown: ["Plan details are being refreshed.", "Your account remains active while billing information loads."],
};

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const session = await getPortalSession();

  if (!session) {
    return <main className="grid min-h-screen place-items-center px-6 py-10"><PortalLoginForm /></main>;
  }

  if (session.memberships.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <Card className="w-full rounded-[28px] border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>Your account does not have a clinic membership yet.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const roleAllowed = membership.role === "admin" || membership.role === "manager";
  const moduleAllowed = membership.modules.length === 0 || membership.modules.includes("billing");

  if (!roleAllowed || !moduleAllowed) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <Card className="w-full rounded-[28px] border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>Your account does not currently have permission to manage clinic billing.</CardDescription>
          </CardHeader>
        </Card>
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
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Subscription and billing"
      pageDescription="A cleaner billing workspace for plan status, renewal timing, invoices, and account actions."
      planName={planName}
      statusLabel={billingStatus}
    >
      {checkoutSuccess ? <Card className="rounded-[24px] border border-emerald-200 bg-emerald-50/80 shadow-sm"><CardContent className="p-4 text-sm font-medium text-emerald-700">Payment completed successfully.</CardContent></Card> : null}
      {portalError ? <Card className="rounded-[24px] border border-rose-200 bg-rose-50/80 shadow-sm"><CardContent className="p-4 text-sm font-medium text-rose-700">{portalMessage ?? "Unable to open billing settings for this clinic right now."}</CardContent></Card> : null}
      {billingError ? <Card className="rounded-[24px] border border-amber-200 bg-amber-50/80 shadow-sm"><CardContent className="p-4 text-sm font-medium text-amber-700">Live billing information is temporarily unavailable. Your clinic account remains active.{billingError ? ` (${billingError})` : ""}</CardContent></Card> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-[32px] border border-[#d9e2e8] bg-white shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardDescription className="text-slate-500">Current plan</CardDescription>
              <Badge className={`rounded-full border-none capitalize ${statusTone(billing?.status ?? membership.subscription?.status ?? "inactive")}`}>{billingStatus}</Badge>
            </div>
            <CardTitle className="text-3xl text-slate-900">{planName}</CardTitle>
            <CardDescription className="text-sm leading-7 text-slate-500">{slimNotes[0]}</CardDescription>
          </CardHeader>
        </Card>

        <Card className="rounded-[32px] border border-[#d9e2e8] bg-white shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
          <CardHeader>
            <CardDescription className="text-slate-500">Next billing cycle</CardDescription>
            <CardTitle className="break-words text-3xl text-slate-900">{nextCycleLabel}</CardTitle>
            <CardDescription className="text-sm leading-7 text-slate-500">Renews {formatDate(nextBillingDate)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-500">
            {hasDiscount && baseCyclePrice != null && cyclePrice != null && baseCyclePrice > cyclePrice ? <div className="flex flex-wrap items-center gap-2"><span className="line-through decoration-slate-400/60">{formatMoney(baseCyclePrice, currency)}</span><Badge className="rounded-full border-none bg-[#e8f8fb] text-[#1297b0]">Adjusted pricing</Badge></div> : null}
            {monthlySavings ? <p>Current pricing is below the standard amount for this plan.</p> : null}
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border border-[#d9e2e8] bg-white shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
          <CardHeader>
            <CardDescription className="text-slate-500">Account note</CardDescription>
            <CardTitle className="text-2xl text-slate-900">Billing summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-slate-500">{accountNote ?? slimNotes[1]}</p>
            <div className="grid gap-2">
              {accountChecklist.map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#e6edf1] bg-[#f8fbfc] px-4 py-3 text-sm text-slate-700"><span className="size-2 rounded-full bg-[#1bb8cf]" /><span>{item}</span></div>)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card className="rounded-[32px] border border-[#d9e2e8] bg-white shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <CardDescription className="text-slate-500">Billing history</CardDescription>
              <CardTitle className="text-2xl text-slate-900">Recent invoices</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-[16px] border-[#d9e2e8] bg-white text-slate-700 hover:bg-slate-50"><a href="/api/billing/manage">Open billing settings</a></Button>
              {invoices[0]?.hostedInvoiceUrl ? <Button asChild className="rounded-[16px] bg-[#1bb8cf] text-white hover:bg-[#1297b0]"><a href={invoices[0].hostedInvoiceUrl} target="_blank" rel="noreferrer">View latest invoice<ArrowUpRight className="size-4" /></a></Button> : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoices.length ? (
              <div className="overflow-hidden rounded-[24px] border border-[#d9e2e8]">
                <div className="hidden grid-cols-[1.1fr_1fr_0.9fr_0.9fr] gap-4 border-b border-[#d9e2e8] bg-[#f8fbfc] px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-slate-400 md:grid"><span>Date</span><span>Plan</span><span>Amount</span><span>Status</span></div>
                <div className="divide-y divide-[#d9e2e8]">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1.1fr_1fr_0.9fr_0.9fr] md:items-center">
                      <div><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 md:hidden">Date</p><p className="text-slate-900">{formatDate(invoice.date)}</p></div>
                      <div><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 md:hidden">Plan</p><p className="text-slate-900">{invoice.planName}</p></div>
                      <div><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 md:hidden">Amount</p><p className="text-slate-900">{formatMoney(invoice.amount, invoice.currency)}</p></div>
                      <div><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 md:hidden">Status</p><Badge className={`rounded-full border-none capitalize ${statusTone(invoice.status)}`}>{humanizeStatus(invoice.status)}</Badge></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="rounded-[28px] border border-dashed border-[#d9e2e8] bg-[#f8fbfc] px-6 py-10 text-center text-sm text-slate-500">No invoice entries available yet.</div>}
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border border-[#d9e2e8] bg-white shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
          <CardHeader>
            <CardDescription className="text-slate-500">Account guidance</CardDescription>
            <CardTitle className="text-2xl text-slate-900">Current billing posture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-500">
            <div className="flex items-start gap-3 rounded-[24px] border border-[#e6edf1] bg-[#f8fbfc] p-4"><ReceiptText className="mt-0.5 size-5 text-[#1297b0]" /><p>{monthlySavings ? `Current pricing is ${formatMoney(monthlySavings, currency)} below the standard plan amount.` : "Your current billing amount is shown exactly as charged for this clinic account."}</p></div>
            <div className="rounded-[24px] border border-[#e6edf1] bg-[#f8fbfc] p-4"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Renewal</p><p className="mt-2 text-base font-semibold text-slate-900">{formatDate(nextBillingDate)}</p></div>
            {hasDiscount && baseCyclePrice != null && cyclePrice != null && baseCyclePrice > cyclePrice ? <div className="rounded-[24px] border border-[#e6edf1] bg-[#f8fbfc] p-4"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Standard rate</p><p className="mt-2 text-base font-semibold text-slate-900 line-through decoration-slate-400/60">{formatMoney(baseCyclePrice, currency)}</p></div> : null}
          </CardContent>
        </Card>
      </div>

      {isActive ? null : <div className="overflow-hidden rounded-[32px] border border-[#d9e2e8] bg-white shadow-sm"><PricingSection /></div>}
    </PortalWorkspaceShell>
  );
}
