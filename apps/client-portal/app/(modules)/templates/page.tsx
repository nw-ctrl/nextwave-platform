import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getDisplayTemplates, listPrescriptionTemplates } from "@/lib/clinical-data";
import { getReadablePortalPlanName } from "@/lib/portal-billing";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const patientId = typeof params.patientId === "string" ? params.patientId : "";
  const session = await getPortalSession();

  if (!session) {
    return <main className="grid min-h-screen place-items-center px-6 py-10"><PortalLoginForm /></main>;
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const planLabel = getReadablePortalPlanName(membership.subscription?.plan);
  const statusLabel = membership.subscription?.status ?? "inactive";
  const templates = getDisplayTemplates(await listPrescriptionTemplates(membership.clientId));

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Templates"
      pageDescription="Diagnosis and prescription templates ready for clinic use."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <Card className="rounded-[32px] border-border/70 shadow-sm">
        <CardHeader>
          <CardDescription>Template library</CardDescription>
          <CardTitle className="text-2xl">Prescription and diagnosis templates</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          {templates.map((template) => (
            <div key={template.id} className="rounded-[28px] border border-border/70 bg-muted/25 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">{template.name}</h2>
                    <Badge variant="outline" className="rounded-full">{template.source === "clinic" ? "Clinic" : "Built-in"}</Badge>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{template.diagnosis || "No diagnosis text"}</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FileText className="size-5" /></div>
              </div>
              <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Prescription</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{template.prescription || "No prescription text"}</p>
                {template.notes ? <><p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{template.notes}</p></> : null}
              </div>
              {patientId ? (
                <Link href={`/patients/${patientId}/visits/new?template=${encodeURIComponent(template.name)}`} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Use for this patient <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalWorkspaceShell>
  );
}

