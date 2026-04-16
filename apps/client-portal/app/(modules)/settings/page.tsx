import { LockKeyhole, Settings2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
      pageDescription="Manage your clinic profile, security posture, and access privileges in the same clinical card system."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-[32px] border border-[#d9e2e8] bg-white shadow-[0_18px_48px_rgba(16,33,50,0.08)] lg:col-span-2">
          <CardHeader>
            <Settings2 className="mb-2 size-6 text-[#1297b0]" />
            <CardTitle className="text-2xl text-slate-900">Clinic Profile</CardTitle>
            <CardDescription className="text-sm leading-7 text-slate-500">
              General clinic properties, identifiers, and billing context.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 items-center border-b border-[#e6edf1] pb-4">
              <span className="text-sm font-medium text-slate-500">Clinic Name</span>
              <span className="col-span-2 text-base text-slate-900">{membership.clinicName}</span>
            </div>
            <div className="grid grid-cols-3 items-center border-b border-[#e6edf1] pb-4">
              <span className="text-sm font-medium text-slate-500">Workspace ID</span>
              <span className="col-span-2 truncate text-sm font-mono text-slate-900">{membership.clientId}</span>
            </div>
            <div className="grid grid-cols-3 items-center">
              <span className="text-sm font-medium text-slate-500">Billing Plan</span>
              <span className="col-span-2">
                <Badge className="mr-2 rounded-full border-none bg-[#e8f8fb] capitalize text-[#1297b0]">{planLabel}</Badge>
                <span className="text-sm capitalize text-slate-500">({statusLabel})</span>
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full rounded-[16px] border-[#d9e2e8] bg-white text-slate-700 hover:bg-slate-50" asChild>
              <a href="/billing">Manage Billing & Subscription</a>
            </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-[32px] border border-[#d9e2e8] bg-white shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
          <CardHeader>
            <ShieldCheck className="mb-2 size-6 text-[#1297b0]" />
            <CardTitle className="text-2xl text-slate-900">Access & Security</CardTitle>
            <CardDescription className="text-slate-500">Your current privileges.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-slate-400">Assigned Role</p>
              <div className="text-lg font-semibold capitalize text-slate-900">{membership.role}</div>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-slate-400">Module Scopes</p>
              {membership.modules.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {membership.modules.map((m) => (
                    <Badge key={m} className="rounded-full border-none bg-[#f8fbfc] capitalize text-slate-700">{m}</Badge>
                  ))}
                </div>
              ) : (
                <Badge className="rounded-full border-none bg-[#e8f8fb] text-[#1297b0]">All Access</Badge>
              )}
            </div>
            <div>
              <p className="mb-1 mt-4 text-xs uppercase tracking-widest text-slate-400">Account Status</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                <LockKeyhole className="size-4 text-emerald-500" />
                <span className="capitalize">{session.user.accountStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalWorkspaceShell>
  );
}
