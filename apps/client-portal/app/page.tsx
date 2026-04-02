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
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(440px,0.9fr)] lg:items-center">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-100 bg-white px-8 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:px-12 lg:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.14),_transparent_34%)]" />
            <div className="relative z-10 space-y-8">
              <Badge className="rounded-full bg-blue-100 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700 shadow-none">
                medivault.nextwave.au
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
                  Clinical control for doctors, with a cleaner desktop workflow.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  Manage patients, prescriptions, templates, and clinic settings from a light, fast web workspace that stays aligned with the Android app.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Doctor profiles", "Prescription layout sync"],
                  ["Visit printing", "4x6 print support"],
                  ["Clinic access", "Role-aware navigation"],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-[1.75rem] border border-blue-100 bg-slate-50/90 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{title}</p>
                    <p className="mt-2 text-sm font-medium text-slate-700">{text}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Designed for</p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">Essential Care to Total Wellness</p>
                </div>
                <div className="text-sm leading-7 text-slate-600">
                  Secure sign-in, clinic switching, doctor profile sync, and printable prescription workflows in one place.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <PortalLoginForm />
          </div>
        </section>
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
    { title: "Open patients", description: "Search and open patient files.", href: "/patients", icon: UserRoundSearch },
    { title: "Register patient", description: "Create a new patient record.", href: "/patients/new", icon: Plus },
    { title: "Open templates", description: "Use saved diagnosis and prescription templates.", href: "/templates", icon: FileText },
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass rounded-[28px] border-none shadow-sm">
          <CardHeader>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Total patients</CardDescription>
            <CardTitle className="text-4xl font-bold tracking-tight">{summary.patientCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass rounded-[28px] border-none shadow-sm">
          <CardHeader>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Total visits</CardDescription>
            <CardTitle className="text-4xl font-bold tracking-tight">{summary.visitCount}</CardTitle>
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
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/25 px-4 py-8 text-sm text-muted-foreground">No patient records yet.</div>
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
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/25 px-4 py-8 text-sm text-muted-foreground">No visit records yet.</div>
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
          {["Search and open patients", "Register a new patient", "Add diagnosis and plan", "Print visit prescription view"].map((item) => (
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
