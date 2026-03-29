import { Activity, CreditCard, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getPortalSession();

  if (!session) {
    return <main className="grid min-h-screen place-items-center px-6 py-10"><PortalLoginForm /></main>;
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const planLabel = getReadablePortalPlanName(membership.subscription?.plan);
  const statusLabel = membership.subscription?.status ?? "inactive";

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Account dashboard"
      pageDescription="A faster summary of the current clinic context with clearer information density for browser-based workflows."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1">Clinic overview</Badge>
            <CardTitle className="text-3xl">{membership.clinicName}</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7">
              The dashboard now sits inside the shared clinical shell so account context, search, and navigation stay consistent across the workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
              <Activity className="size-5 text-primary" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Clinic role</p>
              <p className="mt-2 text-lg font-semibold capitalize text-foreground">{membership.role}</p>
            </div>
            <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
              <CreditCard className="size-5 text-primary" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Plan</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{planLabel}</p>
            </div>
            <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
              <ShieldCheck className="size-5 text-primary" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Subscription status</p>
              <p className="mt-2 text-lg font-semibold capitalize text-foreground">{statusLabel}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>Design direction</CardDescription>
            <CardTitle className="text-2xl">What changed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>The dashboard now benefits from the same premium shell used by the workspace home and billing view.</p>
            <p>This keeps search, clinic switching, theme controls, and role context in one predictable place.</p>
          </CardContent>
        </Card>
      </div>
    </PortalWorkspaceShell>
  );
}
