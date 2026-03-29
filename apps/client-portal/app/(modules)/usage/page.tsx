import { BarChart3, Gauge, Users } from "lucide-react";
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
      pageTitle="Usage and insight"
      pageDescription="A modern analytics shell prepared for future patient, visit, and operational reporting in browser."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1">Workspace module</Badge>
            <CardTitle className="text-3xl">Usage analytics</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7">
              Usage dashboards benefit from focused KPIs, simplified chart regions, and faster scan paths for clinic staff.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
              <BarChart3 className="size-5 text-primary" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Analytics</p>
              <p className="mt-2 text-sm leading-6 text-foreground">Prepared for patient, visit, and operational trends.</p>
            </div>
            <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
              <Gauge className="size-5 text-primary" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Scan speed</p>
              <p className="mt-2 text-sm leading-6 text-foreground">Designed to surface high-value metrics more quickly.</p>
            </div>
            <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
              <Users className="size-5 text-primary" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Clinic activity</p>
              <p className="mt-2 text-sm leading-6 text-foreground">Ready for future clinic-wide usage and engagement indicators.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>Module posture</CardDescription>
            <CardTitle className="text-2xl">Prepared for live metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>This page now sits inside the shared command-driven shell instead of a disconnected placeholder layout.</p>
            <p>That lets future charts and metric panels inherit a stronger visual and navigational system immediately.</p>
          </CardContent>
        </Card>
      </div>
    </PortalWorkspaceShell>
  );
}
