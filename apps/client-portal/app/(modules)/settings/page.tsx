import { LockKeyhole, Settings2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getReadablePortalPlanName } from "@/lib/portal-billing";
import { isAdmin } from "@/lib/role-helper";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getPortalSession();

  if (!session) {
    return <main className="grid min-h-screen place-items-center px-6 py-10"><PortalLoginForm /></main>;
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const adminVisible = isAdmin(session.user) || membership?.role === "manager";
  const planLabel = getReadablePortalPlanName(membership.subscription?.plan);
  const statusLabel = membership.subscription?.status ?? "inactive";

  if (!membership || !adminVisible) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <Card className="w-full rounded-[28px] border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Your account does not currently have permission to access this admin area.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full"><a href="/">Back to workspace</a></Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Workspace settings"
      pageDescription="System-level clinic settings sit inside the same admin shell so configuration tasks feel deliberate and scalable."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1">Admin control</Badge>
            <CardTitle className="text-3xl">Configuration and policy</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7">
              This area is reserved for system-level clinic configuration, governance controls, and future portal-wide preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
              <Settings2 className="size-5 text-primary" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Configuration</p>
              <p className="mt-2 text-sm leading-6 text-foreground">Group administrative settings into a single predictable surface.</p>
            </div>
            <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
              <LockKeyhole className="size-5 text-primary" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Policy</p>
              <p className="mt-2 text-sm leading-6 text-foreground">Prepare this workspace for clinic policies and system-level controls.</p>
            </div>
            <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
              <ShieldCheck className="size-5 text-primary" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Access posture</p>
              <p className="mt-2 text-sm leading-6 text-foreground">Existing access logic remains intact while the shell becomes more professional.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>Current state</CardDescription>
            <CardTitle className="text-2xl">Admin-only workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>Use this area for system-level configuration, clinic policies, and future portal preferences.</p>
            <p>This gives the eventual admin feature set a stronger UI frame before functional expansion.</p>
          </CardContent>
        </Card>
      </div>
    </PortalWorkspaceShell>
  );
}
