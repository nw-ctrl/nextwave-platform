import { LockKeyhole, Settings2, ShieldCheck, CreditCard, Users, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getPortalSession();

  if (!session) {
    return <main className="grid min-h-screen place-items-center px-6 py-10"><PortalLoginForm /></main>;
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];

  if (!membership) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <Card className="w-full rounded-[28px] border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>No valid clinic membership found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full"><a href="/">Back home</a></Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const planLabel = getReadablePortalPlanName(membership.subscription?.plan);
  const statusLabel = membership.subscription?.status ?? "active";

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Clinic Settings"
      pageDescription="Manage your clinic profile, view security metrics, and review access privileges."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Clinic Info */}
        <Card className="rounded-[32px] border-border/70 shadow-sm lg:col-span-2">
          <CardHeader>
            <Settings2 className="size-6 text-primary mb-2" />
            <CardTitle className="text-2xl">Clinic Profile</CardTitle>
            <CardDescription className="text-sm leading-7">
              General clinic properties and identifiers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 items-center border-b pb-4">
              <span className="text-sm font-medium text-muted-foreground">Clinic Name</span>
              <span className="col-span-2 text-base">{membership.clinicName}</span>
            </div>
            <div className="grid grid-cols-3 items-center border-b pb-4">
              <span className="text-sm font-medium text-muted-foreground">Workspace ID</span>
              <span className="col-span-2 text-sm font-mono truncate">{membership.clientId}</span>
            </div>
            <div className="grid grid-cols-3 items-center">
              <span className="text-sm font-medium text-muted-foreground">Billing Plan</span>
              <span className="col-span-2">
                <Badge variant="outline" className="mr-2 capitalize">{planLabel}</Badge>
                <span className="text-sm text-muted-foreground capitalize">({statusLabel})</span>
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full rounded-full" asChild>
              <a href="/billing">Manage Billing & Subscription</a>
            </Button>
          </CardFooter>
        </Card>

        {/* Access Summary */}
        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <ShieldCheck className="size-6 text-primary mb-2" />
            <CardTitle className="text-2xl">Access & Security</CardTitle>
            <CardDescription>Your current privileges.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Assigned Role</p>
              <div className="text-lg font-semibold capitalize">{membership.role}</div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Module Scopes</p>
              {membership.modules.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {membership.modules.map((m) => (
                    <Badge key={m} variant="secondary">{m}</Badge>
                  ))}
                </div>
              ) : (
                <Badge variant="secondary">All Access</Badge>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 mt-4">Account Status</p>
              <div className="flex items-center gap-2 mt-1 text-sm">
                <LockKeyhole className="size-4 text-green-500" />
                <span className="capitalize">{session.user.accountStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </PortalWorkspaceShell>
  );
}
