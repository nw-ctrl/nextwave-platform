import { redirect } from "next/navigation";
import { Activity, ArrowUpRight, CalendarDays, CircleGauge, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { requirePortalContext } from "@/lib/auth";
import { getClinicalWorkspaceSummary } from "@/lib/clinical-data";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

function toneForStatus(status?: string | null) {
  switch (status) {
    case "active":
      return "bg-emerald-400/15 text-emerald-300";
    case "trialing":
      return "bg-sky-500/15 text-sky-300";
    case "past_due":
      return "bg-amber-400/15 text-amber-300";
    case "canceled":
    case "inactive":
      return "bg-rose-400/15 text-rose-300";
    default:
      return "bg-slate-500/15 text-slate-300";
  }
}

export default async function DashboardPage() {
  let ctx;
  try {
    ctx = await requirePortalContext();
  } catch {
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
      pageTitle="Clinical overview"
      pageDescription={`Review operations, subscription status, and recent activity for ${membership.clinicName}.`}
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <Card className="overflow-hidden rounded-[36px] border border-slate-200 bg-white text-slate-900 shadow-[0_28px_80px_rgba(15,23,42,0.15)]">
          <CardContent className="relative p-8 md:p-10">
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.15),_transparent_30%)]" />
            <div className="relative z-10 space-y-8">
              <div className="max-w-4xl space-y-3">
                <Badge className="rounded-full border-none bg-sky-500/15 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200 shadow-none">
                  Operations board
                </Badge>
                <h2 className="text-4xl font-bold tracking-tight text-slate-900">Track clinic status, patient activity, and workspace readiness from one dashboard.</h2>
                <p className="max-w-3xl text-sm leading-7 text-slate-300">
                  This overview keeps the highest-value signals visible first: plan status, role context, patient volume, visit activity, and the most recent clinical changes.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                <div className="flex min-h-[150px] min-w-0 flex-col justify-between rounded-[28px] border border-slate-200 bg-white p-5">
                  <p className="break-words text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Workspace plan</p>
                  <div className="mt-4">
                    <p className="break-words text-2xl font-bold tracking-tight text-slate-900">{planLabel}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">Clinic-facing subscription label</p>
                  </div>
                </div>

                <div className="flex min-h-[150px] min-w-0 flex-col justify-between rounded-[28px] border border-slate-200 bg-white p-5">
                  <p className="break-words text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Current role</p>
                  <div className="mt-4">
                    <p className="break-words text-2xl font-bold tracking-tight capitalize text-slate-900">{membership.role}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{membership.modules.length > 0 ? membership.modules.join(", ") : "Full access"}</p>
                  </div>
                </div>

                <div className="flex min-h-[150px] min-w-0 flex-col justify-between rounded-[28px] border border-slate-200 bg-white p-5">
                  <p className="break-words text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Total patients</p>
                  <div className="mt-4">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">{summary.patientCount}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">Registered and synced</p>
                  </div>
                </div>

                <div className="flex min-h-[150px] min-w-0 flex-col justify-between rounded-[28px] border border-slate-200 bg-white p-5">
                  <p className="break-words text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Total visits</p>
                  <div className="mt-4">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">{summary.visitCount}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">Clinical records logged</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)]">
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Recent patients</p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Latest patient updates</h3>
                    </div>
                    <Users className="size-5 text-sky-300" />
                  </div>
                  <div className="mt-5 grid gap-3">
                    {summary.latestPatients.length > 0 ? summary.latestPatients.map((patient) => (
                      <div key={patient.id} className="grid min-w-0 gap-4 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto]">
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{patient.full_name}</p>
                          <p className="text-sm text-slate-400">Patient code: {patient.patient_code ?? "N/A"}</p>
                        </div>
                        <ArrowUpRight className="size-4 text-slate-500" />
                      </div>
                    )) : <p className="rounded-[24px] border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-400">No patients found. Wait for sync.</p>}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Subscription status</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{planLabel}</p>
                      </div>
                      <Badge className={`rounded-full border-none px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${toneForStatus(statusLabel)}`}>
                        {statusLabel.replaceAll("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Workspace signals</p>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
                        <ShieldCheck className="size-4 text-sky-300" />
                        <span className="text-sm text-slate-200">Billing logic remains unchanged</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
                        <CircleGauge className="size-4 text-sky-300" />
                        <span className="text-sm text-slate-200">Role and module access are active</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-amber-400/8 px-4 py-3">
                        <Activity className="size-4 text-amber-300" />
                        <span className="text-sm text-slate-200">Review current patient and visit activity</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="overflow-hidden rounded-[36px] border border-slate-200 bg-white text-slate-900 shadow-[0_28px_80px_rgba(15,23,42,0.15)]">
            <CardContent className="p-8">
              <div className="grid gap-4">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Patient volume</p>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{summary.patientCount}</p>
                    </div>
                    <Users className="size-9 text-sky-300" />
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Visit throughput</p>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{summary.visitCount}</p>
                    </div>
                    <Activity className="size-9 text-sky-300" />
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Recent visits</p>
                  <div className="mt-4 space-y-3">
                    {summary.latestVisits.length > 0 ? summary.latestVisits.map((visit) => (
                      <div key={visit.id} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">{visit.visit_date ?? "No date"}</p>
                          <CalendarDays className="size-4 text-slate-500" />
                        </div>
                        <p className="mt-2 text-sm text-slate-400">{visit.assessment || "No assessment"}</p>
                      </div>
                    )) : <p className="rounded-[22px] border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-400">No visits recorded yet.</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalWorkspaceShell>
  );
}
