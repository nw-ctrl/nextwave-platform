import Link from "next/link";
import { ArrowRight, FileText, Plus, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardDescription>Patient profile</CardDescription>
              <CardTitle className="text-3xl">{patient.full_name}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="gap-2"><Link href={`/patients/${patient.id}/visits/new`}><Plus className="size-4" />Add diagnosis</Link></Button>
              <Button asChild variant="outline" className="gap-2"><Link href={`/templates?patientId=${patient.id}`}><FileText className="size-4" />Templates</Link></Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-border/70 bg-muted/25 p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Patient code</p><p className="mt-2 text-sm font-medium text-foreground">{patient.patient_code ?? "Not assigned"}</p></div>
            <div className="rounded-[24px] border border-border/70 bg-muted/25 p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Phone</p><p className="mt-2 text-sm font-medium text-foreground">{patient.phone_number || "Not recorded"}</p></div>
            <div className="rounded-[24px] border border-border/70 bg-muted/25 p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Demographics</p><p className="mt-2 text-sm font-medium capitalize text-foreground">{[patient.sex, patient.age != null ? `${patient.age} years` : null, patient.age_months ? `${patient.age_months} months` : null].filter(Boolean).join(" • ") || "Not recorded"}</p></div>
            <div className="rounded-[24px] border border-border/70 bg-muted/25 p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Consent</p><p className="mt-2 text-sm font-medium text-foreground">{patient.digital_consent_granted ? "Recorded" : "Not recorded"}</p></div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>History</CardDescription>
            <CardTitle className="text-2xl">Visit count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-semibold text-foreground">{visits.length}</div>
            <p className="mt-2 text-sm text-muted-foreground">Open a visit below to review diagnosis and print the prescription view.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[32px] border-border/70 shadow-sm">
        <CardHeader>
          <CardDescription>Clinical history</CardDescription>
          <CardTitle className="text-2xl">Visits and diagnoses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {visits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/25 px-4 py-8 text-sm text-muted-foreground">No visits recorded yet.</div>
          ) : (
            visits.map((visit) => (
              <div key={visit.id} className="rounded-[24px] border border-border/70 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-foreground">{visit.assessment || "Clinical visit"}</p>
                      {visit.visit_date ? <Badge variant="outline" className="rounded-full">{visit.visit_date}</Badge> : null}
                    </div>
                    {visit.plan ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{visit.plan}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="gap-2"><Link href={`/patients/${patient.id}/visits/${visit.id}/print`}><Printer className="size-4" />Print</Link></Button>
                    <Button asChild variant="ghost" className="gap-2"><Link href={`/patients/${patient.id}/visits/new`}><ArrowRight className="size-4" />New follow-up</Link></Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PortalWorkspaceShell>
  );
}

