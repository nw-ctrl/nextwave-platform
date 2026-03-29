import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, Plus, UserRoundSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getClinicalWorkspaceSummary } from "@/lib/clinical-data";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

export default async function ClinicPortalHome() {
  const session = await getPortalSession();

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center px-6 py-10">
        <PortalLoginForm />
      </main>
    );
  }

  if (session.memberships.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <Card className="w-full rounded-[28px] border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Clinic portal</CardTitle>
            <CardDescription>Your account is signed in, but it is not attached to a clinic account yet.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const planLabel = getReadablePortalPlanName(membership.subscription?.plan);
  const statusLabel = membership.subscription?.status ?? "inactive";
  const summary = await getClinicalWorkspaceSummary(membership.clientId);

  const quickActions = [
    {
      title: "Open patients",
      description: "Search and open patient files.",
      href: "/patients",
      icon: UserRoundSearch,
    },
    {
      title: "Register patient",
      description: "Create a new patient record.",
      href: "/patients/new",
      icon: Plus,
    },
    {
      title: "Open templates",
      description: "Use saved diagnosis and prescription templates.",
      href: "/templates",
      icon: FileText,
    },
  ];

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Clinical operations"
      pageDescription="Patients, visits, templates, and account context in one working portal."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[28px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>Total patients</CardDescription>
            <CardTitle className="text-3xl">{summary.patientCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-[28px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>Total visits</CardDescription>
            <CardTitle className="text-3xl">{summary.visitCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-[28px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>Current clinic</CardDescription>
            <CardTitle className="text-2xl">{membership.clinicName}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-[32px] border-border/70 shadow-sm">
        <CardHeader>
          <CardDescription>Quick actions</CardDescription>
          <CardTitle className="text-2xl">Start work</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="group rounded-[24px] border border-border/70 bg-muted/25 p-5 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <div className="mt-4">
                  <h2 className="text-lg font-semibold text-foreground">{action.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>Recent patients</CardDescription>
            <CardTitle className="text-2xl">Latest patient updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.latestPatients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/25 px-4 py-8 text-sm text-muted-foreground">
                No patient records yet.
              </div>
            ) : (
              summary.latestPatients.map((patient) => (
                <Link key={patient.id} href={`/patients/${patient.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{patient.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{patient.patient_code ?? "Patient record"}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px]">Open</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>Recent visits</CardDescription>
            <CardTitle className="text-2xl">Latest diagnoses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.latestVisits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/25 px-4 py-8 text-sm text-muted-foreground">
                No visit records yet.
              </div>
            ) : (
              summary.latestVisits.map((visit) => (
                <div key={visit.id} className="rounded-2xl border border-border/70 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{visit.assessment || "Clinical visit"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{visit.visit_date || "No visit date"}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[32px] border-border/70 shadow-sm">
        <CardHeader>
          <CardDescription>Working scope</CardDescription>
          <CardTitle className="text-2xl">Current portal functions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Search and open patients",
            "Register a new patient",
            "Add diagnosis and plan",
            "Print visit prescription view",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/25 px-4 py-3 text-sm text-foreground">
              <ClipboardList className="size-4 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalWorkspaceShell>
  );
}

