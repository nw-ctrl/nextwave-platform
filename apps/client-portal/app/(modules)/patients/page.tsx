import Link from "next/link";
import { Search, UserPlus, UsersRound, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { listPatients, listClinicDoctors } from "@/lib/clinical-data";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

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
    listClinicDoctors(membership.clientId)
  ]);

  const doctorMap = Object.fromEntries(doctors.map(d => [d.id, d.full_name]));

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Patients"
      pageDescription="Search and open read-only patient records securely synced from the selected clinic."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground opacity-40" />
                <form action="/patients" method="GET" className="w-full">
                    <Input 
                        name="q"
                        defaultValue={query}
                        placeholder="Search patients by name or code..." 
                        className="h-12 w-full rounded-2xl border-none bg-white/40 dark:bg-black/20 pl-12 shadow-sm transition-all focus-visible:bg-white/60"
                    />
                </form>
            </div>
            <div className="flex items-center gap-3">
                 <Button className="rounded-2xl h-12 px-6 shadow-md shadow-primary/10">
                    <UserPlus className="size-4 mr-2" />
                    New Patient
                </Button>
            </div>
        </div>

        <div className="grid gap-4">
          {patients.length === 0 ? (
            <Card className="glass border-none rounded-[32px] p-20 text-center italic opacity-40">
              No clinical records found for this workspace.
            </Card>
          ) : (
            patients.map((patient) => {
              const doctorName = doctorMap[patient.doctor_id] || "Unknown Doctor";
              const isOwner = membership.role === 'doctor' && session.user.id === patient.doctor_id;

              return (
              <Link key={patient.id} href={`/patients/${patient.id}`}>
                <Card className="glass border-none rounded-[28px] overflow-hidden group hover:scale-[1.005] transition-all">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner min-w-[3rem]">
                                    <UsersRound className="size-6" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-lg font-bold tracking-tight truncate group-hover:text-primary transition-colors">{patient.full_name}</h4>
                                    <div className="flex flex-wrap items-center gap-3 mt-1 opacity-70">
                                        <span className="text-xs font-mono tracking-wider">{patient.patient_code || "N/A"}</span>
                                        <span className="text-[10px] opacity-40">•</span>
                                        <span className="text-xs font-medium capitalize truncate max-w-[120px]">{doctorName}</span>
                                        <span className="text-[10px] opacity-40">•</span>
                                        <span className="text-xs font-medium capitalize">{[patient.sex, patient.age != null ? `${patient.age}Y` : null].filter(Boolean).join(" • ")}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {membership.role === 'doctor' ? (
                                    isOwner ? (
                                        <Badge className="rounded-full px-3 py-1 bg-emerald-500/10 text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 border-none">
                                            Your Record
                                        </Badge>
                                    ) : (
                                        <Badge className="rounded-full px-3 py-1 bg-black/5 dark:bg-white/10 text-[10px] uppercase font-bold text-muted-foreground border-none">
                                            Read-only ({doctorName})
                                        </Badge>
                                    )
                                ) : (
                                    <Badge variant="outline" className="rounded-full px-3 border-none bg-black/5 dark:bg-white/5 text-[10px] font-bold tracking-tighter uppercase opacity-60">
                                        Dr. {doctorName}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="rounded-full px-3 border-none bg-black/5 dark:bg-white/5 text-[10px] font-bold tracking-tighter uppercase opacity-60">
                                    {patient.is_deleted ? "Archived" : "Active"}
                                </Badge>
                                <ChevronRight className="size-5 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
