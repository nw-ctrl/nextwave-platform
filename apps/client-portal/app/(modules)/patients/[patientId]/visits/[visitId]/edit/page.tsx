import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { VisitCreateForm } from "@/components/visit-create-form";
import { getPortalSession } from "@/lib/auth";
import { getPatientById, getVisitById } from "@/lib/clinical-data";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

export default async function EditVisitPage({ params }: { params: Promise<{ patientId: string; visitId: string }> }) {
  const { patientId, visitId } = await params;
  const session = await getPortalSession();

  if (!session) {
    return <main className="grid min-h-screen place-items-center px-6 py-10"><PortalLoginForm /></main>;
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const planLabel = getReadablePortalPlanName(membership.subscription?.plan);
  const statusLabel = membership.subscription?.status ?? "inactive";
  const [patient, visit] = await Promise.all([
    getPatientById(membership.clientId, patientId),
    getVisitById(membership.clientId, patientId, visitId),
  ]);

  if (!patient || !visit) {
    return (
      <PortalWorkspaceShell user={session.user} memberships={session.memberships} selectedClientId={session.selectedClientId} currentMembership={membership} pageTitle="Visit not found" pageDescription="The selected diagnosis record could not be loaded." planName={planLabel} statusLabel={statusLabel}>
        <Card className="rounded-[32px] border-border/70 shadow-sm"><CardContent className="p-8 text-sm text-muted-foreground">Visit record not found.</CardContent></Card>
      </PortalWorkspaceShell>
    );
  }

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Update diagnosis"
      pageDescription="Edit consultation notes, diagnosis, prescription, and follow-up instructions."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="flex justify-start"><Button asChild variant="ghost" className="gap-2 rounded-[16px] text-slate-700 hover:bg-white/60"><Link href={`/patients/${patient.id}`}><ArrowLeft className="size-4" />Back to patient</Link></Button></div>
      <VisitCreateForm
        mode="edit"
        visitId={visit.id}
        patientId={patient.id}
        patientName={patient.full_name}
        initialValues={{
          patientId: patient.id,
          subjective: visit.subjective ?? "",
          bp: visit.bp ?? "",
          temp: visit.temp ?? "",
          weight: visit.weight ?? "",
          assessment: visit.assessment ?? "",
          plan: visit.plan ?? "",
          visitDate: visit.visit_date ?? "",
          revisitDate: visit.revisit_date ?? "",
        }}
      />
    </PortalWorkspaceShell>
  );
}
