import Link from "next/link";
import { Activity, ArrowRight, CalendarClock, ClipboardList, FileText, Plus, Shield, Sparkles, Stethoscope, UserRoundSearch, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getClinicalWorkspaceSummary, listClinicDoctors } from "@/lib/clinical-data";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

function formatDoctorName(name: string) {
  if (!name) return "Unknown Doctor";
  const trimmed = name.trim();
  if (trimmed.toLowerCase().startsWith("dr.") || trimmed.toLowerCase().startsWith("dr ")) return trimmed;
  return `Dr. ${trimmed}`;
}

export default async function ClinicPortalHome() {
  const session = await getPortalSession();

  if (!session) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#eef3f5_0%,#f8fbfc_100%)] text-slate-900">
        <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(440px,0.9fr)] lg:items-center">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[#d9e2e8] bg-white shadow-[0_32px_90px_rgba(16,33,50,0.12)]">
            <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,_rgba(41,184,199,0.18),_transparent_60%)]" />
            <div className="relative flex flex-col gap-6 px-8 py-10">
              <div className="rounded-[30px] border border-[#d7eef1] bg-[linear-gradient(180deg,#eefafc_0%,#f7fbfc_100%)] px-6 py-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-[#1297b0]">MediFlow</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">Clinical operations, patient records, and practice oversight in one portal</h1>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Built for active practices, this portal keeps patient records, clinical notes, and operational context aligned in one professional workspace.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Clinic-ready", "Immediate patient and visit context"],
                  ["Aligned records", "One source for doctor and patient data"],
                  ["Prescription workflows", "Consistent documentation and print outputs"],
                  ["Role-aware", "Team-aware navigation and settings"],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-[24px] border border-[#e6edf1] bg-[#f8fbfc] px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#1297b0]">{title}</p>
                    <p className="mt-1 text-sm text-slate-800">{desc}</p>
                  </div>
                ))}
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
  const [summary, doctors] = await Promise.all([
    getClinicalWorkspaceSummary(membership.clientId),
    listClinicDoctors(membership.clientId),
  ]);
  const doctorMap = Object.fromEntries(doctors.map((doctor) => [doctor.id, formatDoctorName(doctor.full_name)]));

  const quickActions = [
    { title: "Open patients", description: "Search and open patient files.", href: "/patients", icon: UserRoundSearch, tone: "sky" },
    { title: "Register patient", description: "Create a new patient record.", href: "/patients/new", icon: Plus, tone: "amber" },
    { title: "Open clinical library", description: "Access saved diagnosis and prescription content.", href: "/templates", icon: FileText, tone: "sky" },
  ];

  const operationalNotes = [
    { label: "Doctor directory", value: `${doctors.length}`, helper: "Synced clinicians" },
    { label: "Patient records", value: `${summary.patientCount}`, helper: "Active clinic charts" },
    { label: "Visit volume", value: `${summary.visitCount}`, helper: "Logged encounters" },
  ];

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Clinical operations"
      pageDescription="Patients, visits, billing context, and operational controls in one working portal."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-6">
        <div className="rounded-[34px] border border-[#d9e2e8] bg-white p-5 shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.8fr)]">
            <div className="rounded-[28px] border border-[#e6edf1] bg-[#f8fbfc] p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    <Stethoscope className="size-7" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1297b0]">Current Workspace</p>
                    <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{membership.clinicName}</h2>
                    <p className="mt-1 text-sm text-slate-500">Plan {planLabel} with {statusLabel.replaceAll("_", " ")} subscription access.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/patients/new" className="inline-flex items-center rounded-[16px] bg-[#1bb8cf] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1297b0]">
                    <Plus className="mr-2 size-4" />
                    Add Patient
                  </Link>
                  <Link href="/templates" className="inline-flex items-center rounded-[16px] border border-[#d9e2e8] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    <FileText className="mr-2 size-4" />
                    Open Clinical Library
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {operationalNotes.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-[#e6edf1] bg-white px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{item.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
          <div className="grid gap-6">
            <div className="rounded-[34px] border border-[#d9e2e8] bg-white p-6 shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <div>
                  <Badge className="rounded-full border-none bg-[#e8f8fb] px-4 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1297b0] shadow-none">
                    Clinical operations
                  </Badge>
                  <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Keep patient movement, visits, and documentation visible in one clinical surface.</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                    The portal keeps the same records and actions underneath, but presents them in a lighter, more structured workspace suited to daily clinical operations.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    const toneClass = action.tone === "amber"
                      ? "bg-[#fff4e8] text-[#d48318]"
                      : "bg-[#e8f8fb] text-[#1297b0]";

                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="group min-w-0 rounded-[24px] border border-[#e6edf1] bg-[#f8fbfc] p-5 transition-all hover:-translate-y-0.5 hover:bg-white"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}>
                              <Icon className="size-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="break-words text-base font-semibold text-slate-900">{action.title}</p>
                              <p className="mt-1 break-words text-sm leading-6 text-slate-500">{action.description}</p>
                            </div>
                          </div>
                          <ArrowRight className="mt-1 size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-900" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <Card className="overflow-hidden rounded-[34px] border border-[#d9e2e8] bg-white text-slate-900 shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Recent patients</p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Latest patient updates</h3>
                    </div>
                    <UsersRound className="size-5 text-[#1297b0]" />
                  </div>
                  <div className="mt-5 grid gap-3">
                    {summary.latestPatients.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed border-[#d9e2e8] bg-[#f8fbfc] px-4 py-8 text-sm text-slate-500">No patient records yet.</div>
                    ) : (
                      summary.latestPatients.map((patient) => (
                        <Link
                          key={patient.id}
                          href={`/patients/${patient.id}`}
                          className="group grid min-w-0 gap-4 rounded-[24px] border border-[#e6edf1] bg-[#f8fbfc] px-5 py-4 transition-all hover:border-[#d9e2e8] hover:bg-white md:grid-cols-[minmax(0,1fr)_auto]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{patient.full_name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span>{patient.patient_code ?? "Patient record"}</span>
                              <span className="opacity-30">|</span>
                              <span>{doctorMap[patient.doctor_id] ?? "Unknown Doctor"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="rounded-full border border-[#d9e2e8] bg-white px-3 py-1">Open chart</span>
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[34px] border border-[#d9e2e8] bg-white text-slate-900 shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
                <CardContent className="p-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Visit stream</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Latest diagnoses</h3>
                  </div>
                  <div className="mt-5 space-y-3">
                    {summary.latestVisits.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed border-[#d9e2e8] bg-[#f8fbfc] px-4 py-8 text-sm text-slate-500">No visit records yet.</div>
                    ) : (
                      summary.latestVisits.map((visit) => (
                        <div key={visit.id} className="min-w-0 rounded-[24px] border border-[#e6edf1] bg-[#f8fbfc] px-5 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <p className="break-words text-sm font-semibold text-slate-900">{visit.assessment || "Clinical visit"}</p>
                            <Activity className="size-4 shrink-0 text-slate-400" />
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <CalendarClock className="size-3.5" />
                            <span>{visit.visit_date || "No visit date"}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="overflow-hidden rounded-[34px] border border-[#d9e2e8] bg-white text-slate-900 shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
              <CardContent className="p-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Clinic snapshot</p>
                    <h3 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900">{membership.clinicName}</h3>
                  </div>
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8fb]">
                    <Sparkles className="size-5 text-[#1297b0]" />
                  </div>
                </div>

                <div className="mt-8 grid gap-4">
                  <div className="rounded-[28px] border border-[#e6edf1] bg-[#f8fbfc] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Subscription</p>
                        <p className="mt-2 break-words text-lg font-semibold text-slate-900">{planLabel}</p>
                      </div>
                      <Badge className="rounded-full border-none bg-[#e8f8fb] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1297b0]">
                        {statusLabel}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[#e6edf1] bg-[#f8fbfc] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8fb] text-[#1297b0]">
                        <Shield className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Environment</p>
                        <p className="mt-1 break-words text-sm font-semibold text-slate-900">Low-glare clinical mode</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[#e6edf1] bg-[#f8fbfc] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Today&apos;s focus</p>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                        <UsersRound className="size-4 shrink-0 text-[#1297b0]" />
                        <span className="text-sm text-slate-700">Review newly updated patient charts</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-[#fff7ec] px-4 py-3">
                        <ClipboardList className="size-4 shrink-0 text-[#d48318]" />
                        <span className="text-sm text-slate-700">Review current documentation and prescribing content</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                        <Stethoscope className="size-4 shrink-0 text-[#1297b0]" />
                        <span className="text-sm text-slate-700">Confirm doctor profile and print settings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <Card className="rounded-[34px] border border-[#d9e2e8] bg-white text-slate-900 shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
            <CardHeader className="pb-4">
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Active scope</CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-900">Operational coverage</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
              {["Search and open patients", "Register a new patient", "Add diagnosis and plan", "Print visit prescription view"].map((item, index) => (
                <div key={item} className={`min-w-0 flex items-center gap-3 rounded-[22px] border px-4 py-3 text-sm ${index === 1 ? "border-[#f5d9b1] bg-[#fff7ec] text-slate-800" : "border-[#e6edf1] bg-[#f8fbfc] text-slate-700"}`}>
                  <ClipboardList className={`size-4 shrink-0 ${index === 1 ? "text-[#d48318]" : "text-[#1297b0]"}`} />
                  <span className="break-words">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalWorkspaceShell>
  );
}
