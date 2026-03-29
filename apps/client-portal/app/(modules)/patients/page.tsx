import Link from "next/link";
import { Search, UserRoundPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { listPatients } from "@/lib/clinical-data";
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
  const patients = await listPatients(membership.clientId, query);

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Patients"
      pageDescription="Search and open patient records across the selected clinic."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <Card className="rounded-[32px] border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardDescription>Patient search</CardDescription>
            <CardTitle className="text-2xl">Patient register</CardTitle>
          </div>
          <Button asChild className="gap-2">
            <Link href="/patients/new"><UserRoundPlus className="size-4" />New patient</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" defaultValue={query} placeholder="Search by patient name, phone, ID, or code" className="pl-9" />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border-border/70 shadow-sm">
        <CardHeader>
          <CardDescription>Results</CardDescription>
          <CardTitle className="text-2xl">{patients.length} patient records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patients.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/25 px-4 py-8 text-sm text-muted-foreground">
              No patient records found.
            </div>
          ) : (
            patients.map((patient) => (
              <Link key={patient.id} href={`/patients/${patient.id}`} className="flex flex-col gap-3 rounded-[24px] border border-border/70 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.03] md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-semibold text-foreground">{patient.full_name}</p>
                    {patient.patient_code ? <Badge variant="outline" className="rounded-full">{patient.patient_code}</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[patient.sex, patient.age != null ? `${patient.age}y` : null, patient.phone_number, patient.cnic].filter(Boolean).join(" • ") || "No extra demographic details"}
                  </p>
                </div>
                <div className="text-sm text-primary">Open record</div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </PortalWorkspaceShell>
  );
}

