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
      <div className="grid gap-8">
        <Card className="glass border-none rounded-[32px] overflow-hidden">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:p-8">
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground opacity-50">Patient command center</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Open the right chart faster and keep the assigned doctor visible.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  This queue now removes repeated doctor labels and gives each chart a clearer clinical summary. The layout stays consistent with the current portal shell while moving toward a denser EMR workspace.
                </p>
              </div>

              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground opacity-40" />
                <form action="/patients" method="GET" className="w-full">
                  <Input
                    name="q"
                    defaultValue={query}
                    placeholder="Search patients by name, phone, CNIC, or patient code..."
                    className="h-13 w-full rounded-[22px] border-none bg-white/10 pl-12 shadow-[0_10px_40px_rgba(2,6,23,0.35)] transition-all focus-visible:bg-white/20"
                  />
                </form>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[28px] border border-white/10 bg-slate-900/60 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">Visible patients</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight">{patients.length}</p>
                  </div>
                  <UsersRound className="size-9 text-primary/70" />
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-900/60 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">Assigned to you</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight">{ownedCount}</p>
                  </div>
                  <Stethoscope className="size-9 text-primary/70" />
                </div>
              </div>

              <Link href="/patients/new" className="rounded-[28px] border border-primary/20 bg-slate-900/70 p-5 shadow-sm transition-all hover:bg-slate-900/80">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">New registration</p>
                    <p className="mt-2 text-lg font-bold tracking-tight text-foreground">Create patient</p>
                    <p className="mt-1 text-sm text-muted-foreground">Open a new chart and start a visit flow immediately.</p>
                  </div>
                  <UserPlus className="size-9 text-primary" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {patients.length === 0 ? (
            <Card className="glass border-none rounded-[32px] p-20 text-center italic opacity-40">
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
                <Link key={patient.id} href={`/patients/${patient.id}`}>
                  <Card className="glass border-none rounded-[30px] overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="mt-1 flex size-12 min-w-[3rem] items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                            <UsersRound className="size-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="truncate text-lg font-bold tracking-tight transition-colors group-hover:text-primary">{patient.full_name}</h4>
                              <Badge variant="outline" className="rounded-full border-none bg-black/5 text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">
                                {patient.is_deleted ? "Archived" : "Active"}
                              </Badge>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-3 opacity-70">
                              <span className="text-xs font-mono tracking-wider">{patient.patient_code || "N/A"}</span>
                              <span className="text-[10px] opacity-40">|</span>
                              <span className="text-xs font-medium capitalize">{demographics || "Not recorded"}</span>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                              <div className="rounded-[20px] border border-border/50 bg-white/60 px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground opacity-60">Attending doctor</p>
                                <p className="mt-1 text-sm font-semibold text-foreground">{doctorName}</p>
                              </div>

                              {membership.role === "doctor" ? (
                                isOwner ? (
                                  <Badge className="h-fit rounded-full border-none bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                                    Your Record
                                  </Badge>
                                ) : (
                                  <Badge className="h-fit rounded-full border-none bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase text-amber-700">
                                    Read-only
                                  </Badge>
                                )
                              ) : (
                                <Badge className="h-fit rounded-full border-none bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase text-sky-700">
                                  Shared clinic chart
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 xl:justify-end">
                          <div className="hidden rounded-full border border-border/50 bg-white/60 px-3 py-2 text-xs text-muted-foreground md:inline-flex">
                            Open chart
                          </div>
                          <ChevronRight className="size-5 text-muted-foreground opacity-20 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
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
