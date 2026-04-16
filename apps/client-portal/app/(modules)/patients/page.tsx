import Link from "next/link";
import { ChevronRight, Search, Stethoscope, UserPlus, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { listClinicDoctors, listPatients } from "@/lib/clinical-data";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

function formatDoctorName(name: string) {
  if (!name) return "Unknown Doctor";
  const trimmed = name.trim();
  if (trimmed.toLowerCase().startsWith("dr.") || trimmed.toLowerCase().startsWith("dr ")) return trimmed;
  return `Dr. ${trimmed}`;
}

export default async function PatientsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const query = typeof params.q === "string" ? params.q : "";
  const session = await getPortalSession();

  if (!session) {
    return <main className="grid min-h-screen place-items-center px-6 py-10"><PortalLoginForm /></main>;
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const planLabel = getReadablePortalPlanName(membership.subscription?.plan);
  const statusLabel = membership.subscription?.status ?? "inactive";

  const [patients, doctors] = await Promise.all([
    listPatients(membership.clientId, query),
    listClinicDoctors(membership.clientId),
  ]);

  const doctorMap = Object.fromEntries(doctors.map((doctor) => [doctor.id, formatDoctorName(doctor.full_name)]));
  const ownedCount = patients.filter((patient) => patient.doctor_id === session.user.id).length;

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Patients"
      pageDescription="Search, review, and open patient charts with clearer doctor attribution across the workspace."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-6">
        <Card className="overflow-hidden rounded-[34px] border border-[#d9e2e8] bg-white shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:p-8">
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1297b0]">Patient command center</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Open the right chart faster and keep the assigned doctor visible.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  The patient queue now sits inside the same light clinical workspace as the dashboard, with clearer chart summaries and less visual noise.
                </p>
              </div>

              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <form action="/patients" method="GET" className="w-full">
                  <Input
                    name="q"
                    defaultValue={query}
                    placeholder="Search patients by name, phone, CNIC, or patient code..."
                    className="h-12 w-full rounded-[20px] border border-[#d9e2e8] bg-[#f8fbfc] pl-12 text-slate-900 shadow-sm transition-all focus-visible:bg-white"
                  />
                </form>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[28px] border border-[#e6edf1] bg-[#f8fbfc] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Visible patients</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{patients.length}</p>
                  </div>
                  <UsersRound className="size-9 text-[#1297b0]" />
                </div>
              </div>

              <div className="rounded-[28px] border border-[#e6edf1] bg-[#f8fbfc] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Assigned to you</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{ownedCount}</p>
                  </div>
                  <Stethoscope className="size-9 text-[#1297b0]" />
                </div>
              </div>

              <Link href="/patients/new" className="rounded-[28px] border border-[#d9e2e8] bg-white p-5 shadow-sm transition-all hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1297b0]">New registration</p>
                    <p className="mt-2 text-lg font-bold tracking-tight text-slate-900">Create patient</p>
                    <p className="mt-1 text-sm text-slate-500">Open a new chart and start a visit flow immediately.</p>
                  </div>
                  <UserPlus className="size-9 text-[#1297b0]" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {patients.length === 0 ? (
            <Card className="rounded-[32px] border border-[#d9e2e8] bg-white p-20 text-center italic text-slate-500 shadow-sm">
              No clinical records found for this workspace.
            </Card>
          ) : (
            patients.map((patient) => {
              const doctorName = doctorMap[patient.doctor_id] || "Unknown Doctor";
              const isOwner = membership.role === "doctor" && session.user.id === patient.doctor_id;
              const demographics = [patient.sex, patient.age != null ? `${patient.age}Y` : null, patient.age_months != null ? `${patient.age_months}M` : null]
                .filter(Boolean)
                .join(" | ");

              return (
                <Link key={patient.id} href={`/patients/${patient.id}`} className="group">
                  <Card className="border border-[#d9e2e8] bg-white text-slate-900 shadow-[0_15px_40px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="mt-1 flex size-12 min-w-[3rem] items-center justify-center rounded-2xl bg-[#e8f8fb] text-[#1297b0]">
                            <UsersRound className="size-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="truncate text-lg font-bold tracking-tight transition-colors group-hover:text-[#1297b0]">{patient.full_name}</h4>
                              <Badge variant="outline" className="rounded-full border-none bg-slate-100 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                                {patient.is_deleted ? "Archived" : "Active"}
                              </Badge>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-3 text-slate-500">
                              <span className="text-xs font-mono tracking-wider">{patient.patient_code || "N/A"}</span>
                              <span className="text-[10px] opacity-40">|</span>
                              <span className="text-xs font-medium capitalize">{demographics || "Not recorded"}</span>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                              <div className="rounded-[20px] border border-[#e6edf1] bg-[#f8fbfc] px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Attending doctor</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{doctorName}</p>
                              </div>

                              {membership.role === "doctor" ? (
                                isOwner ? (
                                  <Badge className="h-fit rounded-full border-none bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase text-emerald-700">
                                    Your Record
                                  </Badge>
                                ) : (
                                  <Badge className="h-fit rounded-full border-none bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase text-amber-700">
                                    Read-only
                                  </Badge>
                                )
                              ) : (
                                <Badge className="h-fit rounded-full border-none bg-[#e8f8fb] px-3 py-1 text-[10px] font-bold uppercase text-[#1297b0]">
                                  Shared clinic chart
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 xl:justify-end">
                          <div className="hidden rounded-full border border-[#d9e2e8] bg-[#f8fbfc] px-3 py-2 text-xs text-slate-700 md:inline-flex">
                            Open chart
                          </div>
                          <ChevronRight className="size-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-900" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </PortalWorkspaceShell>
  );
}
