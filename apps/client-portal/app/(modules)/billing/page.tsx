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
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatDate(value?: string | null) {
  if (!value) return "Available in your account";

  try {
    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function humanizeStatus(status?: string | null) {
  if (!status) return "Not available";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(status?: string | null) {
  switch (status) {
    case "active":
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "trialing":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "past_due":
    case "open":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "canceled":
    case "unpaid":
    case "void":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

const planFeatureNotes: Record<string, string[]> = {
  basic: ["Your clinic is on the Basic plan.", "You can review or change plan settings from the billing area."],
  standard: ["Your clinic is on the Standard plan.", "This plan supports routine day-to-day clinic operations."],
  premium: ["Your clinic is on the Premium plan.", "This plan includes the broadest level of access currently available."],
  custom: ["Your clinic is on a custom plan.", "For plan adjustments, use billing settings or contact support."],
  unknown: ["Plan details are being refreshed.", "Your account remains active while billing information loads."],
};

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const session = await getPortalSession();

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center px-6 py-10">
        <PortalLoginForm />
      </main>
    );
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
      pageDescription="A clearer billing workspace with stronger hierarchy for plan status, renewal timing, invoices, and account actions."
      planName={planName}
      statusLabel={billingStatus}
    >
      {checkoutSuccess ? (
        <Card className="rounded-[24px] border-emerald-200 bg-emerald-50/80 shadow-sm">
          <CardContent className="p-4 text-sm font-medium text-emerald-700">Payment completed successfully.</CardContent>
        </Card>
      ) : null}

      {portalError ? (
        <Card className="rounded-[24px] border-rose-200 bg-rose-50/80 shadow-sm">
          <CardContent className="p-4 text-sm font-medium text-rose-700">{portalMessage ?? "Unable to open billing settings for this clinic right now."}</CardContent>
        </Card>
      ) : null}

      {billingError ? (
        <Card className="rounded-[24px] border-amber-200 bg-amber-50/80 shadow-sm">
          <CardContent className="p-4 text-sm font-medium text-amber-700">
            Live billing information is temporarily unavailable. Your clinic account remains active.
            {billingError ? ` (${billingError})` : ""}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardDescription>Current plan</CardDescription>
              <Badge variant="outline" className={`rounded-full capitalize ${statusTone(billing?.status ?? membership.subscription?.status ?? "inactive")}`}>{billingStatus}</Badge>
            </div>
            <CardTitle className="text-3xl">{planName}</CardTitle>
            <CardDescription className="text-sm leading-7">{slimNotes[0]}</CardDescription>
          </CardHeader>
        </Card>

        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>Next billing cycle</CardDescription>
            <CardTitle className="break-words text-3xl">{nextCycleLabel}</CardTitle>
            <CardDescription className="text-sm leading-7">Renews {formatDate(nextBillingDate)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {hasDiscount && baseCyclePrice != null && cyclePrice != null && baseCyclePrice > cyclePrice ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="line-through decoration-muted-foreground/60">{formatMoney(baseCyclePrice, currency)}</span>
                <Badge variant="secondary" className="rounded-full">Adjusted pricing</Badge>
              </div>
            ) : null}
            {monthlySavings ? <p>Current pricing is below the standard amount for this plan.</p> : null}
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>Account note</CardDescription>
            <CardTitle className="text-2xl">Billing summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted-foreground">{accountNote ?? slimNotes[1]}</p>
            <div className="grid gap-2">
              {accountChecklist.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-foreground">
                  <span className="size-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <CardDescription>Billing history</CardDescription>
              <CardTitle className="text-2xl">Recent invoices</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-full">
                <a href="/api/billing/manage">Open billing settings</a>
              </Button>
              {invoices[0]?.hostedInvoiceUrl ? (
                <Button asChild className="rounded-full">
                  <a href={invoices[0].hostedInvoiceUrl} target="_blank" rel="noreferrer">
                    View latest invoice
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoices.length ? (
              <div className="overflow-hidden rounded-[24px] border border-border/70">
                <div className="hidden grid-cols-[1.1fr_1fr_0.9fr_0.9fr] gap-4 border-b border-border/70 bg-muted/40 px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:grid">
                  <span>Date</span>
                  <span>Plan</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>
                <div className="divide-y divide-border/70">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1.1fr_1fr_0.9fr_0.9fr] md:items-center">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:hidden">Date</p>
                        <p className="text-foreground">{formatDate(invoice.date)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:hidden">Plan</p>
                        <p className="text-foreground">{invoice.planName}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:hidden">Amount</p>
                        <p className="text-foreground">{formatMoney(invoice.amount, invoice.currency)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:hidden">Status</p>
                        <Badge variant="outline" className={`rounded-full capitalize ${statusTone(invoice.status)}`}>{humanizeStatus(invoice.status)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-border/80 bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">No invoice entries available yet.</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>Account guidance</CardDescription>
            <CardTitle className="text-2xl">Current billing posture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <div className="flex items-start gap-3 rounded-[24px] border border-border/70 bg-muted/30 p-4">
              <ReceiptText className="mt-0.5 size-5 text-primary" />
              <p>{monthlySavings ? `Current pricing is ${formatMoney(monthlySavings, currency)} below the standard plan amount.` : "Your current billing amount is shown exactly as charged for this clinic account."}</p>
            </div>
            <div className="rounded-[24px] border border-border/70 bg-muted/30 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Renewal</p>
              <p className="mt-2 text-base font-semibold text-foreground">{formatDate(nextBillingDate)}</p>
            </div>
            {hasDiscount && baseCyclePrice != null && cyclePrice != null && baseCyclePrice > cyclePrice ? (
              <div className="rounded-[24px] border border-border/70 bg-muted/30 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Standard rate</p>
                <p className="mt-2 text-base font-semibold text-foreground line-through decoration-muted-foreground/60">{formatMoney(baseCyclePrice, currency)}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {isActive ? null : (
        <div className="overflow-hidden rounded-[32px] border border-border/70 bg-card/95 shadow-sm">
          <PricingSection />
        </div>
      )}
    </PortalWorkspaceShell>
  );
}
