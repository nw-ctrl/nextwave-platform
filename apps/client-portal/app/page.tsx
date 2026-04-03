import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, Plus, Sparkles, Stethoscope, UserRoundSearch, UsersRound, Activity, CalendarClock } from "lucide-react";
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
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_42%,#f8fafc_100%)]">
        <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(440px,0.9fr)] lg:items-center">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 px-8 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl lg:px-12 lg:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.14),_transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.7),rgba(255,255,255,0.4))]" />
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
                  <div key={title} className="rounded-[1.75rem] border border-white/70 bg-white/55 p-5 backdrop-blur-xl">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{title}</p>
                    <p className="mt-2 text-sm font-medium text-slate-700">{text}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(219,234,254,0.72),rgba(236,254,255,0.72))] p-6 backdrop-blur-xl sm:grid-cols-2">
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
  const [summary, doctors] = await Promise.all([
    getClinicalWorkspaceSummary(membership.clientId),
    listClinicDoctors(membership.clientId),
  ]);
  const doctorMap = Object.fromEntries(doctors.map((doctor) => [doctor.id, formatDoctorName(doctor.full_name)]));

  const quickActions = [
    { title: "Open patients", description: "Search and open patient files.", href: "/patients", icon: UserRoundSearch },
    { title: "Register patient", description: "Create a new patient record.", href: "/patients/new", icon: Plus },
    { title: "Open templates", description: "Use saved diagnosis and prescription templates.", href: "/templates", icon: FileText },
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <Card className="overflow-hidden rounded-[36px] border border-white/60 bg-white/72 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur-2xl">
          <CardContent className="relative p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.05),_transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.65),rgba(255,255,255,0.35))]" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <Badge className="rounded-full bg-sky-100 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700 shadow-none">
                  Care coordination
                </Badge>

                <div className="space-y-3">
                  <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900">Run the clinic from one sharper desktop surface.</h2>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600">
                    This workspace is moving toward a denser clinical console: clearer patient ownership, quicker navigation, and more purposeful information blocks without leaving the MediVault shell.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {operationalNotes.map((item) => (
                    <div key={item.label} className="flex min-h-[144px] flex-col justify-between rounded-[28px] border border-white/70 bg-white/58 p-5 backdrop-blur-xl">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                      <div className="mt-4">
                        <p className="text-3xl font-bold tracking-tight text-slate-900">{item.value}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{item.helper}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="group rounded-[28px] border border-white/70 bg-white/58 p-5 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                            <Icon className="size-5" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-slate-900">{action.title}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">{action.description}</p>
                          </div>
                        </div>
                        <ArrowRight className="mt-1 size-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-700" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.94))] text-white shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Clinic snapshot</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">{membership.clinicName}</h3>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="size-5 text-sky-300" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Subscription</p>
                    <p className="mt-2 text-lg font-semibold">{planLabel}</p>
                  </div>
                  <Badge className="rounded-full border-none bg-emerald-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                    {statusLabel}
                  </Badge>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Today&apos;s focus</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
                    <UsersRound className="size-4 text-sky-300" />
                    <span className="text-sm text-slate-200">Review incoming patient charts</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
                    <ClipboardList className="size-4 text-sky-300" />
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="rounded-[34px] border border-white/60 bg-white/72 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur-2xl">
          <CardHeader className="pb-4">
            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Recent patients</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">Latest patient updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.latestPatients.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">No patient records yet.</div>
            ) : (
              summary.latestPatients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="group grid gap-4 rounded-[24px] border border-white/70 bg-white/58 px-5 py-4 backdrop-blur-xl transition-all hover:border-sky-200 hover:bg-white/72 hover:shadow-sm md:grid-cols-[minmax(0,1fr)_auto]"
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
                    <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 backdrop-blur-xl">Open chart</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-[34px] border border-white/60 bg-white/72 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur-2xl">
            <CardHeader className="pb-4">
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Visit stream</CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-900">Latest diagnoses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.latestVisits.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">No visit records yet.</div>
              ) : (
                summary.latestVisits.map((visit) => (
                  <div key={visit.id} className="rounded-[24px] border border-white/70 bg-white/58 px-5 py-4 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-slate-900">{visit.assessment || "Clinical visit"}</p>
                      <Activity className="size-4 text-slate-400" />
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <CalendarClock className="size-3.5" />
                      <span>{visit.visit_date || "No visit date"}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[34px] border border-white/60 bg-white/72 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur-2xl">
            <CardHeader className="pb-4">
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Active scope</CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-900">Operational coverage</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {["Search and open patients", "Register a new patient", "Add diagnosis and plan", "Print visit prescription view"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[22px] border border-white/70 bg-white/58 px-4 py-3 text-sm text-slate-700 backdrop-blur-xl">
                  <ClipboardList className="size-4 text-sky-600" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalWorkspaceShell>
  );
}
