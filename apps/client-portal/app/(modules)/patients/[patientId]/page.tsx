import Link from "next/link";
import { FileText, Phone, Printer, ShieldCheck, Stethoscope, UserRound, ArrowUpRight, PencilLine, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getPatientById, listClinicDoctors, listVisitsForPatient } from "@/lib/clinical-data";
import { getReadablePortalPlanName } from "@/lib/portal-billing";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatDoctorName(name: string) {
  if (!name) return "Unknown Doctor";
  const trimmed = name.trim();
  if (trimmed.toLowerCase().startsWith("dr.") || trimmed.toLowerCase().startsWith("dr ")) return trimmed;
  return `Dr. ${trimmed}`;
}

export default async function PatientDetailPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  const session = await getPortalSession();

  if (!session) {
    return <main className="grid min-h-screen place-items-center px-6 py-10"><PortalLoginForm /></main>;
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const planLabel = getReadablePortalPlanName(membership.subscription?.plan);
  const statusLabel = membership.subscription?.status ?? "inactive";
  const patient = await getPatientById(membership.clientId, patientId);

  if (!patient) {
    return (
      <PortalWorkspaceShell user={session.user} memberships={session.memberships} selectedClientId={session.selectedClientId} currentMembership={membership} pageTitle="Patient not found" pageDescription="The requested patient could not be loaded in the selected clinic." planName={planLabel} statusLabel={statusLabel}>
        <Card className="rounded-[32px] border-border/70 shadow-sm"><CardContent className="p-8 text-sm text-muted-foreground">Patient record not found.</CardContent></Card>
      </PortalWorkspaceShell>
    );
  }

  const [visits, doctors] = await Promise.all([
    listVisitsForPatient(membership.clientId, patient.id),
    listClinicDoctors(membership.clientId),
  ]);

  const doctorMap = Object.fromEntries(doctors.map((doctor) => [doctor.id, formatDoctorName(doctor.full_name)]));
  const attendingDoctor = doctorMap[patient.doctor_id] || "Unknown Doctor";
  const demographics = [patient.sex, patient.age != null ? `${patient.age}Y` : null, patient.age_months != null ? `${patient.age_months}M` : null]
    .filter(Boolean)
    .join(" | ");

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle={patient.full_name}
      pageDescription="Patient profile, assigned doctor, demographics, and longitudinal visit history."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
        <Card className="glass-panel text-slate-900">
          <CardHeader className="p-8 pb-5">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div>
                  <CardDescription className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#1297b0]">Clinical profile</CardDescription>
                  <CardTitle className="text-4xl font-bold tracking-tight text-slate-900">{patient.full_name}</CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border-none bg-[#e8f8fb] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1297b0]">
                    {patient.patient_code ?? "No patient code"}
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-none bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                    {patient.is_deleted ? "Archived" : "Active"}
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-none bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                    {attendingDoctor}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild variant="outline" className="h-11 rounded-2xl border-[#d9e2e8] bg-white/70 px-5 font-semibold text-slate-700 transition-all hover:bg-white">
                  <Link href={`/patients/${patient.id}/edit`}>
                    <PencilLine className="mr-2 size-4" />
                    Edit Patient
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-2xl border-[#d9e2e8] bg-white/70 px-5 font-semibold text-slate-700 transition-all hover:bg-white">
                  <Link href={`/patients/${patient.id}/visits/new`}>
                    <Plus className="mr-2 size-4" />
                    Add Diagnosis
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-2xl border-[#d7eef1] bg-[#eef9fb] px-5 font-semibold text-[#1297b0] transition-all hover:bg-[#e8f8fb]">
                  <Link href={`/templates?patientId=${patient.id}`}>
                    <FileText className="mr-2 size-4" />
                    Apply Template
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 p-8 pt-2 md:grid-cols-2">
            <div className="glass-soft rounded-[24px] p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#e8f8fb] text-[#1297b0]">
                  <Stethoscope className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Assigned doctor</p>
                  <p className="mt-1 text-sm font-semibold tracking-tight text-slate-900">{attendingDoctor}</p>
                </div>
              </div>
            </div>

            <div className="glass-soft rounded-[24px] p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#e8f8fb] text-[#1297b0]">
                  <Phone className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Primary phone</p>
                  <p className="mt-1 text-sm font-semibold tracking-tight text-slate-900">{patient.phone_number || "No number recorded"}</p>
                </div>
              </div>
            </div>

            <div className="glass-soft rounded-[24px] p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#e8f8fb] text-[#1297b0]">
                  <UserRound className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Demographics</p>
                  <p className="mt-1 text-sm font-semibold tracking-tight capitalize text-slate-900">{demographics || "Not recorded"}</p>
                </div>
              </div>
            </div>

            <div className="glass-soft rounded-[24px] p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#e8f8fb] text-[#1297b0]">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Data consent</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className={cn("size-2 rounded-full", patient.digital_consent_granted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-orange-500")} />
                    <p className="text-sm font-semibold text-slate-900">{patient.digital_consent_granted ? "Digital Consent Secured" : "Pending Signature"}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel rounded-[32px] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardDescription className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#1297b0]">Activity snapshot</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Patient timeline</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-8 pt-2">
            <div className="glass-soft rounded-[28px] p-6 text-center">
              <div className="text-6xl font-light tracking-tighter text-[#1297b0]">{visits.length}</div>
              <p className="mt-2 text-xs font-medium text-slate-500">Recorded interactions</p>
            </div>
            <div className="glass-soft rounded-[28px] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Latest visit</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{visits[0]?.visit_date || "No visits yet"}</p>
              <p className="mt-1 text-sm text-slate-500">{visits[0]?.assessment || "No assessment recorded"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="px-2">
          <h3 className="text-xl font-bold tracking-tight">Clinical log</h3>
          <p className="text-xs text-muted-foreground opacity-60">Longitudinal visit notes, diagnoses, and printable prescription access.</p>
        </div>

        <div className="grid gap-4">
          {visits.length === 0 ? (
            <Card className="glass border-none rounded-[32px] p-12 text-center italic opacity-40">
              No clinical history found for this patient yet.
            </Card>
          ) : (
            visits.map((visit) => {
              const visitDoctor = doctorMap[visit.doctor_id] || attendingDoctor;
              return (
                <Card key={visit.id} className="glass-panel rounded-[30px] overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge className="rounded-full border-none bg-[#1bb8cf] px-3 py-1 text-white shadow-sm">{visit.visit_date || "Clinic Visit"}</Badge>
                          <h4 className="text-lg font-bold tracking-tight text-slate-900">{visit.assessment || "Routine Checkup"}</h4>
                          <Badge variant="outline" className="rounded-full border-none bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                            {visitDoctor}
                          </Badge>
                        </div>

                        {visit.subjective ? (
                          <div className="glass-soft rounded-[22px] p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Subjective</p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{visit.subjective}</p>
                          </div>
                        ) : null}

                        {visit.plan ? (
                          <div className="rounded-[22px] border border-[#d7eef1] bg-[#eef9fb]/78 p-4 backdrop-blur-xl">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1297b0]">Plan / prescription</p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{visit.plan}</p>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button asChild variant="ghost" className="h-11 rounded-xl px-5 text-slate-700 hover:bg-slate-100">
                          <Link href={`/patients/${patient.id}/visits/${visit.id}/edit`}>
                            <PencilLine className="mr-2 size-4" />
                            Edit
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" className="h-11 rounded-xl px-5 text-slate-700 hover:bg-[#eef9fb]">
                          <Link href={`/patients/${patient.id}/visits/${visit.id}/print`}>
                            <Printer className="mr-2 size-4" />
                            Print Prescription
                          </Link>
                        </Button>
                        <ArrowUpRight className="size-4 text-slate-400 opacity-60" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </PortalWorkspaceShell>
  );
}

