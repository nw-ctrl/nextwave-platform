import { redirect } from "next/navigation";
import { requirePortalContext } from "@/lib/auth";
import { getClinicalWorkspaceSummary } from "@/lib/clinical-data";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let ctx;
  try {
    ctx = await requirePortalContext();
  } catch (err) {
    redirect("/login");
  }

  const { membership, clientId, session } = ctx;
  const summary = await getClinicalWorkspaceSummary(clientId);
  const planLabel = getReadablePortalPlanName(membership.subscription?.plan);
  const statusLabel = membership.subscription?.status ?? "inactive";

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={clientId}
      currentMembership={membership}
      pageTitle="Clinical Overview"
      pageDescription={`Welcome back to ${membership.clinicName}. Here is your clinic's activity at a glance.`}
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass rounded-[32px] border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-70">Current Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight capitalize">{membership.role}</div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-1.5 opacity-60">
              {membership.modules.length > 0 ? membership.modules.join(", ") : "Full Access"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass rounded-[32px] border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-70">Workspace Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight capitalize">{membership.subscription?.plan ?? "Basic"}</div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-1.5 opacity-60">
              Subscription: {membership.subscription?.status ?? "Active"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass rounded-[32px] border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-70">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{summary.patientCount}</div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-1.5 opacity-60">Registered & Synced</p>
          </CardContent>
        </Card>

        <Card className="glass rounded-[32px] border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-70">Total Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{summary.visitCount}</div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-1.5 opacity-60">Clinical Records</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass rounded-[32px] border-none">
          <CardHeader>
            <CardTitle className="text-lg">Recent Patients</CardTitle>
            <CardDescription className="text-xs">Latest registered members at this clinic.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.latestPatients.length > 0 ? (
              <ul className="space-y-3">
                {summary.latestPatients.map((patient) => (
                  <li key={patient.id} className="flex justify-between items-center rounded-2xl bg-white/40 p-3 dark:bg-black/20 hover:bg-white/60 transition-colors">
                    <div className="font-medium text-sm">{patient.full_name}</div>
                    <Badge variant="secondary" className="rounded-full text-[10px] bg-primary/10 text-primary border-none">
                      {patient.patient_code ?? "N/A"}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center italic opacity-60">No patients found. Wait for sync.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass rounded-[32px] border-none">
          <CardHeader>
            <CardTitle className="text-lg">Recent Visits</CardTitle>
            <CardDescription className="text-xs">Latest consultation entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.latestVisits.length > 0 ? (
              <ul className="space-y-3">
                {summary.latestVisits.map((visit) => (
                  <li key={visit.id} className="flex flex-col rounded-2xl bg-white/40 p-3 dark:bg-black/20 hover:bg-white/60 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                       <div className="font-medium text-sm">{visit.visit_date}</div>
                       <ArrowUpRight className="size-3 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground truncate opacity-70">{visit.assessment || "No assessment"}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center italic opacity-60">No visits recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalWorkspaceShell>
  );
}
