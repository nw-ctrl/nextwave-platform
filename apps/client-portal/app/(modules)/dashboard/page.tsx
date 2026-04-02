import { redirect } from "next/navigation";
import { Activity, ArrowUpRight, CalendarDays, CircleGauge, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { BentoCard } from "@/components/dashboard/BentoCard";
import { BentoGrid } from "@/components/dashboard/BentoGrid";
import { requirePortalContext } from "@/lib/auth";
import { getClinicalWorkspaceSummary } from "@/lib/clinical-data";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

function toneForStatus(status?: string | null) {
  switch (status) {
    case "active":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    case "trialing":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "past_due":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "canceled":
    case "inactive":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-blue-100 bg-blue-50 text-slate-700";
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
      pageTitle="Clinical Overview"
      pageDescription={`Welcome back to ${membership.clinicName}. Review operations, subscription status, and recent activity from one expanding dashboard.`}
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="rounded-[2rem] border border-blue-100 bg-slate-50 p-4 md:p-6">
        <BentoGrid>
          <BentoCard
            title="Workspace Plan"
            gridSpan="xl:col-span-2"
            detailContent={
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className={`rounded-full capitalize ${toneForStatus(statusLabel)}`}>{statusLabel.replaceAll("_", " ")}</Badge>
                  <span className="text-sm text-slate-500">Visible name only changed. Stored plan keys remain untouched.</span>
                </div>
                <div className="rounded-3xl border border-blue-100 bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Current subscription</p>
                  <p className="mt-2 text-3xl font-bold text-slate-800">{planLabel}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">Admin and doctor-facing portal surfaces now use Essential Care, Advanced Practice, and Total Wellness while preserving the existing basic, standard, and premium billing logic underneath.</p>
                </div>
              </div>
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-bold text-slate-800">{planLabel}</p>
                <p className="mt-2 text-sm text-slate-500">Subscription status is shown with the new clinic-facing naming.</p>
              </div>
              <ShieldCheck className="h-10 w-10 text-blue-500" />
            </div>
          </BentoCard>

          <BentoCard
            title="Current Role"
            detailContent={
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CircleGauge className="h-8 w-8 text-cyan-500" />
                  <div>
                    <p className="text-2xl font-bold capitalize text-slate-800">{membership.role}</p>
                    <p className="text-sm text-slate-500">Role access remains unchanged.</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-blue-100 bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Enabled modules</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{membership.modules.length > 0 ? membership.modules.join(", ") : "Full Access"}</p>
                </div>
              </div>
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-bold capitalize text-slate-800">{membership.role}</p>
                <p className="mt-2 text-sm text-slate-500">{membership.modules.length > 0 ? membership.modules.join(", ") : "Full Access"}</p>
              </div>
              <CircleGauge className="h-10 w-10 text-cyan-500" />
            </div>
          </BentoCard>

          <BentoCard title="Total Patients">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-bold text-slate-800">{summary.patientCount}</p>
                <p className="mt-2 text-sm text-slate-500">Registered and synced</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </BentoCard>

          <BentoCard title="Total Visits">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-bold text-slate-800">{summary.visitCount}</p>
                <p className="mt-2 text-sm text-slate-500">Clinical records</p>
              </div>
              <Activity className="h-10 w-10 text-cyan-500" />
            </div>
          </BentoCard>

          <BentoCard
            title="Recent Patients"
            gridSpan="xl:col-span-2"
            detailContent={
              <div className="space-y-3">
                {summary.latestPatients.length > 0 ? summary.latestPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between rounded-3xl border border-blue-100 bg-slate-50 px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-800">{patient.full_name}</p>
                      <p className="text-sm text-slate-500">Patient code: {patient.patient_code ?? "N/A"}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-blue-400" />
                  </div>
                )) : <p className="rounded-3xl border border-dashed border-blue-100 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">No patients found. Wait for sync.</p>}
              </div>
            }
          >
            <div className="space-y-3">
              {summary.latestPatients.length > 0 ? summary.latestPatients.slice(0, 3).map((patient) => (
                <div key={patient.id} className="rounded-2xl border border-blue-100 bg-slate-50 px-4 py-3">
                  <p className="font-medium text-slate-700">{patient.full_name}</p>
                  <p className="text-xs text-slate-500">{patient.patient_code ?? "N/A"}</p>
                </div>
              )) : <p className="rounded-2xl border border-dashed border-blue-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No patients found.</p>}
            </div>
          </BentoCard>

          <BentoCard
            title="Recent Visits"
            gridSpan="xl:col-span-2"
            detailContent={
              <div className="space-y-3">
                {summary.latestVisits.length > 0 ? summary.latestVisits.map((visit) => (
                  <div key={visit.id} className="rounded-3xl border border-blue-100 bg-slate-50 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-800">{visit.visit_date ?? "No date"}</p>
                      <CalendarDays className="h-4 w-4 text-blue-400" />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{visit.assessment || "No assessment"}</p>
                  </div>
                )) : <p className="rounded-3xl border border-dashed border-blue-100 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">No visits recorded yet.</p>}
              </div>
            }
          >
            <div className="space-y-3">
              {summary.latestVisits.length > 0 ? summary.latestVisits.slice(0, 3).map((visit) => (
                <div key={visit.id} className="rounded-2xl border border-blue-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-700">{visit.visit_date ?? "No date"}</p>
                    <ArrowUpRight className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{visit.assessment || "No assessment"}</p>
                </div>
              )) : <p className="rounded-2xl border border-dashed border-blue-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No visits recorded.</p>}
            </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </PortalWorkspaceShell>
  );
}
