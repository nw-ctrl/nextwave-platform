import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PatientCreateForm } from "@/components/patient-create-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getPatientById } from "@/lib/clinical-data";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

export default async function EditPatientPage({ params }: { params: Promise<{ patientId: string }> }) {
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
      pageTitle="Update patient"
      pageDescription="Edit demographics, contact details, consent, and patient code."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="flex justify-start"><Button asChild variant="ghost" className="gap-2 rounded-[16px] text-slate-700 hover:bg-white/60"><Link href={`/patients/${patient.id}`}><ArrowLeft className="size-4" />Back to patient</Link></Button></div>
      <PatientCreateForm
        mode="edit"
        patientId={patient.id}
        initialValues={{
          fullName: patient.full_name,
          phoneNumber: patient.phone_number ?? "",
          sex: patient.sex ?? "female",
          age: patient.age ?? 0,
          ageMonths: patient.age_months ?? 0,
          cnic: patient.cnic ?? "",
          patientCode: patient.patient_code ?? "",
          digitalConsentGranted: patient.digital_consent_granted ?? false,
        }}
      />
    </PortalWorkspaceShell>
  );
}
