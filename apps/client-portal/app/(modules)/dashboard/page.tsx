import { redirect } from "next/navigation";
import { requirePortalContext } from "@/lib/auth";
import { getClinicalWorkspaceSummary } from "@/lib/clinical-data";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let ctx;
  try {
    ctx = await requirePortalContext();
  } catch (err) {
    redirect("/login");
  }

  const { membership, clientId, session } = ctx;
  const summary = await getClinicalWorkspaceSummary(clientId);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back to {membership.clinicName}, {session.user.fullName ?? session.user.email}.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{membership.role}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Modules: {membership.modules.length > 0 ? membership.modules.join(", ") : "All"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {membership.subscription?.plan ?? "Basic"} Plan
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Status: <Badge variant="outline">{membership.subscription?.status ?? "active"}</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.patientCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered in synced dataset</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.visitCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Recorded in synced dataset</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>Latest registered members at this clinic.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.latestPatients.length > 0 ? (
              <ul className="space-y-4">
                {summary.latestPatients.map((patient) => (
                  <li key={patient.id} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="font-medium">{patient.full_name}</div>
                    <div className="text-sm text-muted-foreground">Code: {patient.patient_code ?? "N/A"}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No patients found. Wait for Android sync or add new.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Visits</CardTitle>
            <CardDescription>Latest consultation entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.latestVisits.length > 0 ? (
              <ul className="space-y-4">
                {summary.latestVisits.map((visit) => (
                  <li key={visit.id} className="flex flex-col border-b pb-2 last:border-0 last:pb-0">
                    <div className="font-medium">{visit.visit_date}</div>
                    <div className="text-sm text-muted-foreground truncate">{visit.assessment || "No assessment"}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No visits found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
