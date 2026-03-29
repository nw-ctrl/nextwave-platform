import Link from "next/link";
import { headers } from "next/headers";
import { ArrowRight, BriefcaseMedical, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClinicSelectorCard } from "@/components/clinic-selector-card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getPortalNavItems } from "@/lib/portal-navigation";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

function humanizeRole(role?: string | null) {
  if (!role) return "Doctor";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default async function ClinicPortalHome({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const requestHeaders = await headers();
  const tenantSlug = requestHeaders.get("x-tenant-slug");
  await searchParams;
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

  const currentMembership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const navItems = getPortalNavItems(session, currentMembership);
  const roleLabel = humanizeRole(session.user.role || "doctor");
  const planLabel = getReadablePortalPlanName(currentMembership.subscription?.plan);
  const statusLabel = currentMembership.subscription?.status ?? "inactive";

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={currentMembership}
      pageTitle="Clinical workspace overview"
      pageDescription="A calmer browser workspace for day-to-day clinic use. Navigation, context, and subscription details are surfaced clearly without changing the underlying portal behavior."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
        <Card className="overflow-hidden rounded-[32px] border-border/70 bg-card/95 shadow-sm">
          <CardContent className="space-y-6 p-7 md:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">MediFlow Clinical Workspace</Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">Secure access</Badge>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">{currentMembership.clinicName}</h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                A controlled browser workspace with clearer account context, more readable hierarchy, and a calmer visual rhythm suited to consulting room screens and mobile browsers.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">{roleLabel}</Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">{planLabel}</Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 capitalize">{statusLabel}</Badge>
              {tenantSlug ? <Badge variant="outline" className="rounded-full px-3 py-1">{tenantSlug}</Badge> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-border/70 bg-muted/40 p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Signed in as</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{session.user.fullName ?? session.user.email}</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-muted/40 p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Workspace mode</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{roleLabel} access</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-border/70 bg-card/95 shadow-sm">
          <CardHeader>
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1">Workspace standards</Badge>
            <CardTitle className="text-2xl">Calm, readable, and client-safe</CardTitle>
            <CardDescription className="text-sm leading-7">
              The shell now surfaces only relevant account paths while keeping role context, security posture, and subscription information visible from entry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3 rounded-3xl border border-border/70 bg-muted/40 p-4">
              <ShieldCheck className="mt-0.5 size-5 text-primary" />
              <p>Clearer access framing reduces ambiguity during day-to-day use.</p>
            </div>
            <div className="flex items-start gap-3 rounded-3xl border border-border/70 bg-muted/40 p-4">
              <BriefcaseMedical className="mt-0.5 size-5 text-primary" />
              <p>Desktop and mobile browser layouts now share the same premium shell.</p>
            </div>
            <div className="flex items-start gap-3 rounded-3xl border border-border/70 bg-muted/40 p-4">
              <Sparkles className="mt-0.5 size-5 text-primary" />
              <p>Machine-like labels and dead-end surfaces are being removed from the visible experience.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="rounded-[32px] border border-border/70 bg-card/95 p-2 shadow-sm">
          <ClinicSelectorCard memberships={session.memberships} selectedClientId={session.selectedClientId} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Card className="rounded-[28px] border-border/70 shadow-sm">
            <CardHeader>
              <CardDescription>Account role</CardDescription>
              <CardTitle className="text-2xl">{roleLabel}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">Role handling remains unchanged and still defaults safely when no explicit web role is present.</CardContent>
          </Card>
          <Card className="rounded-[28px] border-border/70 shadow-sm">
            <CardHeader>
              <CardDescription>Available destinations</CardDescription>
              <CardTitle className="text-2xl">{navItems.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">Only active and role-appropriate workspace areas are shown in navigation.</CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-[32px] border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <CardDescription>Workspace destinations</CardDescription>
            <CardTitle className="text-2xl">Available areas</CardTitle>
          </div>
          <CardDescription className="max-w-2xl text-sm leading-6">The shell keeps navigation focused on live, useful account destinations so the portal feels more trustworthy and easier to scan.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.key} href={item.href} className="group rounded-[28px] border border-border/70 bg-muted/30 p-5 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <div className="mt-5 space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{item.label}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </PortalWorkspaceShell>
  );
}
