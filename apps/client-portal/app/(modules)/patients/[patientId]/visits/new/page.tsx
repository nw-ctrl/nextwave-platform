import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { VisitCreateForm } from "@/components/visit-create-form";
import { getPortalSession } from "@/lib/auth";
import { getTemplateByName } from "@/lib/clinical-templates";
import { getPatientById } from "@/lib/clinical-data";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

export default async function NewVisitPage({ params, searchParams }: { params: Promise<{ patientId: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const { patientId } = await params;
  const search = (await searchParams) ?? {};
  const templateName = typeof search.template === "string" ? search.template : "";
  const template = getTemplateByName(templateName);
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
      <PortalWorkspaceShell user={session.user} memberships={session.memberships} selectedClientId={session.selectedClientId} currentMembership={membership} pageTitle="Patient not found" pageDescription="The selected patient could not be loaded." planName={planLabel} statusLabel={statusLabel}>
        <Card className="rounded-[32px] border-border/70 shadow-sm"><CardContent className="p-8 text-sm text-muted-foreground">Patient record not found.</CardContent></Card>
      </PortalWorkspaceShell>
    );
  }

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Add diagnosis"
      pageDescription="Record consultation notes, diagnosis, prescription, and follow-up instructions."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="flex justify-start"><Button asChild variant="ghost" className="gap-2"><Link href={`/patients/${patient.id}`}><ArrowLeft className="size-4" />Back to patient</Link></Button></div>
      <VisitCreateForm patientId={patient.id} patientName={patient.full_name} initialValues={template ? { assessment: template.diagnosis, plan: `Prescription\n${template.prescription}\n\nNotes\n${template.notes}` } : undefined} />
    </PortalWorkspaceShell>
  );
}

