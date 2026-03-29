import Link from "next/link";
import { FileText, Printer, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getPatientById, listVisitsForPatient } from "@/lib/clinical-data";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

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

  const visits = await listVisitsForPatient(membership.clientId, patient.id);

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle={patient.full_name}
      pageDescription="Patient profile, demographics, and visit history."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="glass border-none rounded-[32px] overflow-hidden">
          <CardHeader className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between p-8 pb-4">
            <div>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1.5 ml-0.5">Clinical Profile</CardDescription>
              <CardTitle className="text-4xl font-bold tracking-tight">{patient.full_name}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-2xl h-11 border-none bg-primary/10 text-primary hover:bg-primary/20 transition-all font-semibold px-5">
                <Link href={`/templates?patientId=${patient.id}`}>
                    <FileText className="size-4 mr-2" />
                    Apply Template
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 p-8 pt-6">
            <div className="rounded-[24px] bg-black/5 dark:bg-white/5 p-5 transition-all hover:bg-black/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 mb-2">Patient code</p>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-lg px-2 font-mono text-sm tracking-widest">{patient.patient_code ?? "N/A"}</Badge>
                </div>
            </div>
            <div className="rounded-[24px] bg-black/5 dark:bg-white/5 p-5 transition-all hover:bg-black/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 mb-2">Primary Phone</p>
                <p className="text-sm font-semibold tracking-tight">{patient.phone_number || "No number recorded"}</p>
            </div>
            <div className="rounded-[24px] bg-black/5 dark:bg-white/5 p-5 transition-all hover:bg-black/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 mb-2">Vitals / Demographics</p>
                <p className="text-sm font-semibold tracking-tight capitalize">
                    {[patient.sex, patient.age != null ? `${patient.age}Y` : null, patient.age_months ? `${patient.age_months}M` : null].filter(Boolean).join(" • ") || "Not recorded"}
                </p>
            </div>
            <div className="rounded-[24px] bg-black/5 dark:bg-white/5 p-5 transition-all hover:bg-black/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 mb-2">Data Consent</p>
                <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full", patient.digital_consent_granted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-orange-500")} />
                    <p className="text-sm font-semibold">{patient.digital_consent_granted ? "Digital Consent Secured" : "Pending Signature"}</p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none rounded-[32px] overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1.5 ml-0.5">Activity</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight">Visit History</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4 flex-1 flex flex-col justify-center items-center text-center">
            <div className="text-7xl font-light tracking-tighter text-primary/80 mb-2">{visits.length}</div>
            <p className="text-xs font-medium text-muted-foreground opacity-70">Recorded interactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <div>
                <h3 className="text-xl font-bold tracking-tight">Clinical Log</h3>
                <p className="text-xs text-muted-foreground opacity-60">Complete audit trail of diagnoses and prescriptions.</p>
            </div>
        </div>
        
        <div className="grid gap-4">
          {visits.length === 0 ? (
            <Card className="glass border-none rounded-[32px] p-12 text-center italic opacity-40">
              No clinical history found for this patient yet.
            </Card>
          ) : (
            visits.map((visit) => (
              <Card key={visit.id} className="glass border-none rounded-[28px] overflow-hidden group hover:scale-[1.005] transition-all">
                <CardContent className="p-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                                <Badge className="rounded-full px-3 py-1 bg-primary text-primary-foreground shadow-sm">{visit.visit_date || 'Clinic Visit'}</Badge>
                                <h4 className="text-lg font-bold tracking-tight text-foreground">{visit.assessment || "Routine Checkup"}</h4>
                            </div>
                            {visit.plan ? (
                                <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-4 text-sm leading-6 text-muted-foreground border-l-2 border-primary/30">
                                    <p className="whitespace-pre-wrap">{visit.plan}</p>
                                </div>
                            ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" className="rounded-xl h-11 px-5 hover:bg-primary/5">
                                <Link href={`/patients/${patient.id}/visits/${visit.id}/print`}>
                                    <Printer className="size-4 mr-2" />
                                    Print Prescription
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PortalWorkspaceShell>
  );
}

