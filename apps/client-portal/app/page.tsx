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
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(180deg,#09111d_0%,#0d1624_45%,#101a2a_100%)] text-white">
        <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)] lg:items-center">
          <div className="relative overflow-hidden rounded-[2.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,25,40,0.84),rgba(8,14,24,0.96))] px-8 py-10 shadow-[0_35px_120px_rgba(2,6,23,0.45)] backdrop-blur-2xl lg:px-12 lg:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.10),_transparent_24%)]" />
            <div className="relative z-10 space-y-8">
              <Badge className="rounded-full border-none bg-sky-500/15 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-200 shadow-none">
                medivault.nextwave.au
              </Badge>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  Clinical software should feel calm, sharp, and built for long days.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  Access patients, prescriptions, templates, and clinic operations from a darker, quieter workspace that stays aligned with the Android app and reduces screen fatigue.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Doctor profiles", "Prescription layout sync"],
                  ["Visit printing", "4x6 print support"],
                  ["Clinic access", "Role-aware navigation"],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{title}</p>
                    <p className="mt-2 text-sm font-medium text-slate-100">{text}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),rgba(15,23,42,0.12))] p-6 backdrop-blur-xl sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Designed for</p>
                  <p className="mt-2 text-2xl font-bold text-white">Essential Care to Total Wellness</p>
                </div>
                <div className="text-sm leading-7 text-slate-300">
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
  const [summary, doctors] = await Promise.all([
    getClinicalWorkspaceSummary(membership.clientId),
    listClinicDoctors(membership.clientId),
  ]);
  const doctorMap = Object.fromEntries(doctors.map((doctor) => [doctor.id, formatDoctorName(doctor.full_name)]));

  const quickActions = [
    { title: "Open patients", description: "Search and open patient files.", href: "/patients", icon: UserRoundSearch, tone: "sky" },
    { title: "Register patient", description: "Create a new patient record.", href: "/patients/new", icon: Plus, tone: "amber" },
    { title: "Open templates", description: "Use saved diagnosis and prescription templates.", href: "/templates", icon: FileText, tone: "sky" },
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
      pageDescription="Patients, visits, templates, and account context in one working portal."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="relative overflow-hidden rounded-[40px] border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_20%),linear-gradient(180deg,#0b1220_0%,#0d1524_42%,#101826_100%)] p-5 shadow-[0_30px_120px_rgba(2,6,23,0.35)]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <Card className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(7,11,18,0.9))] text-white shadow-[0_28px_80px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
            <CardContent className="relative p-8 md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.08),_transparent_22%)]" />
              <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  <Badge className="rounded-full border-none bg-sky-500/15 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200 shadow-none">
                    Care command
                  </Badge>

                  <div className="space-y-3">
                    <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-white">Keep the clinic under control without drowning in forms.</h2>
                    <p className="max-w-2xl text-sm leading-7 text-slate-300">
                      The home surface keeps the same information, but reorganizes it into calmer, higher-contrast modules so patient work, templates, and review tasks stay readable for an entire workday.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {operationalNotes.map((item) => (
                      <div key={item.label} className="flex min-h-[150px] flex-col justify-between rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                        <div className="mt-4">
                          <p className="text-3xl font-bold tracking-tight text-white">{item.value}</p>
                          <p className="mt-2 text-xs leading-5 text-slate-400">{item.helper}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    const toneClass = action.tone === "amber"
                      ? "bg-amber-400/12 text-amber-200"
                      : "bg-sky-500/12 text-sky-200";

                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="group rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`flex size-11 items-center justify-center rounded-2xl ${toneClass}`}>
                              <Icon className="size-5" />
                            </div>
                            <div>
                              <p className="text-base font-semibold text-white">{action.title}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-400">{action.description}</p>
                            </div>
                          </div>
                          <ArrowRight className="mt-1 size-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(2,6,23,0.94))] text-white shadow-[0_28px_80px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Clinic snapshot</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">{membership.clinicName}</h3>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
                    <Sparkles className="size-5 text-sky-300" />
                  </div>
                </div>

                <div className="mt-8 grid gap-4">
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Subscription</p>
                        <p className="mt-2 text-lg font-semibold text-white">{planLabel}</p>
                      </div>
                      <Badge className="rounded-full border-none bg-emerald-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                        {statusLabel}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-500/12 text-sky-300">
                        <Shield className="size-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Environment</p>
                        <p className="mt-1 text-sm font-semibold text-white">Low-glare desktop mode</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Today&apos;s focus</p>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
                        <UsersRound className="size-4 text-sky-300" />
                        <span className="text-sm text-slate-200">Review incoming patient charts</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-amber-400/8 px-4 py-3">
                        <ClipboardList className="size-4 text-amber-300" />
                        <span className="text-sm text-slate-200">Verify active prescription templates</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
                        <Stethoscope className="size-4 text-sky-300" />
                        <span className="text-sm text-slate-200">Confirm doctor print settings are aligned</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Card className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.76),rgba(8,13,22,0.9))] text-white shadow-[0_18px_48px_rgba(2,6,23,0.22)] backdrop-blur-2xl">
            <CardHeader className="pb-4">
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Recent patients</CardDescription>
              <CardTitle className="text-2xl font-bold text-white">Latest patient updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.latestPatients.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 px-4 py-8 text-sm text-slate-400">No patient records yet.</div>
              ) : (
                summary.latestPatients.map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/patients/${patient.id}`}
                    className="group grid gap-4 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/[0.07] md:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{patient.full_name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>{patient.patient_code ?? "Patient record"}</span>
                        <span className="opacity-30">|</span>
                        <span>{doctorMap[patient.doctor_id] ?? "Unknown Doctor"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Open chart</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.76),rgba(8,13,22,0.9))] text-white shadow-[0_18px_48px_rgba(2,6,23,0.22)] backdrop-blur-2xl">
              <CardHeader className="pb-4">
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Visit stream</CardDescription>
                <CardTitle className="text-2xl font-bold text-white">Latest diagnoses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.latestVisits.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 px-4 py-8 text-sm text-slate-400">No visit records yet.</div>
                ) : (
                  summary.latestVisits.map((visit) => (
                    <div key={visit.id} className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-white">{visit.assessment || "Clinical visit"}</p>
                        <Activity className="size-4 text-slate-500" />
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                        <CalendarClock className="size-3.5" />
                        <span>{visit.visit_date || "No visit date"}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.76),rgba(8,13,22,0.9))] text-white shadow-[0_18px_48px_rgba(2,6,23,0.22)] backdrop-blur-2xl">
              <CardHeader className="pb-4">
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Active scope</CardDescription>
                <CardTitle className="text-2xl font-bold text-white">Operational coverage</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {["Search and open patients", "Register a new patient", "Add diagnosis and plan", "Print visit prescription view"].map((item, index) => (
                  <div key={item} className={`flex items-center gap-3 rounded-[22px] border px-4 py-3 text-sm ${index === 1 ? "border-amber-400/20 bg-amber-400/8 text-slate-100" : "border-white/10 bg-white/5 text-slate-200"}`}>
                    <ClipboardList className={`size-4 ${index === 1 ? "text-amber-300" : "text-sky-300"}`} />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalWorkspaceShell>
  );
}
