import { FileText, Sparkles, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

export default async function Page() {
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
      pageTitle="Templates"
      pageDescription="A calmer shell for future prescription and clinic template workflows, with stronger readability for dense clinical content."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1">Workspace module</Badge>
            <CardTitle className="text-3xl">Prescription and clinic templates</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7">
              Template surfaces benefit from dense-but-readable cards, clearer defaults, and role-aware editing states.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
              <FileText className="size-5 text-primary" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Structured content</p>
              <p className="mt-2 text-sm leading-6 text-foreground">Prepared for repeatable prescription and clinic note structures.</p>
            </div>
            <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
              <Stethoscope className="size-5 text-primary" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Clinical readability</p>
              <p className="mt-2 text-sm leading-6 text-foreground">Built to handle content-dense editing surfaces more comfortably.</p>
            </div>
            <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
              <Sparkles className="size-5 text-primary" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Future-ready shell</p>
              <p className="mt-2 text-sm leading-6 text-foreground">The shell is ready for real template workflows when those routes are exposed.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>Module posture</CardDescription>
            <CardTitle className="text-2xl">Prepared for expansion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>This module now shares the same navigation, search, and command system as the rest of the workspace.</p>
            <p>That gives future template editing screens a more credible product foundation from the start.</p>
          </CardContent>
        </Card>
      </div>
    </PortalWorkspaceShell>
  );
}
