import { PortalLoginForm } from "@/components/portal-login-form";
import { PatientCreateForm } from "@/components/patient-create-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

export default async function NewPatientPage() {
  const session = await getPortalSession();

  if (!session) {
    return <main className="grid min-h-screen place-items-center px-6 py-10"><PortalLoginForm /></main>;
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const planLabel = getReadablePortalPlanName(membership.subscription?.plan);
  const statusLabel = membership.subscription?.status ?? "inactive";

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="New patient"
      pageDescription="Create a patient record for the selected clinic."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-4">
        <PatientCreateForm />
      </div>
    </PortalWorkspaceShell>
  );
}

