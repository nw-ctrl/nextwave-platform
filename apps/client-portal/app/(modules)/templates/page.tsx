import Link from "next/link";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <div className="grid gap-8">
        <div className="flex items-center justify-between px-2">
            <div>
                <h3 className="text-xl font-bold tracking-tight">Clinical Library</h3>
                <p className="text-xs text-muted-foreground opacity-60">Manage your pre-set diagnoses and treatment plans.</p>
            </div>
            <Button className="rounded-2xl h-11 px-6 shadow-sm">
                New Template
            </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {templates.length === 0 ? (
            <Card className="glass border-none rounded-[32px] p-20 text-center italic opacity-40 col-span-full">
              No templates found for this clinic.
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="glass border-none rounded-[32px] overflow-hidden group hover:scale-[1.005] transition-all">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                            <FileText className="size-5" />
                        </div>
                        <h4 className="text-xl font-bold tracking-tight">{template.name}</h4>
                        <Badge variant="secondary" className="rounded-full bg-primary/5 text-[10px] font-bold text-primary border-none px-3 uppercase tracking-wider">
                            {template.source === "clinic" ? "Custom" : "Built-in"}
                        </Badge>
                      </div>
                      <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-4 text-sm leading-6 text-muted-foreground border-l-2 border-primary/30">
                        <p className="whitespace-pre-wrap">{template.diagnosis || "No diagnosis assigned"}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-4">
                  <div className="rounded-[24px] border border-white/20 bg-white/40 dark:bg-black/10 p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 mb-3">Prescription Content</p>
                    <p className="text-sm font-medium leading-relaxed text-foreground whitespace-pre-wrap italic">
                        {template.prescription || "Empty prescription body"}
                    </p>
                  </div>
                  {template.notes ? (
                    <div className="px-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-30 mb-1">Internal Notes</p>
                      <p className="text-xs text-muted-foreground opacity-60 leading-relaxed font-medium">{template.notes}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PortalWorkspaceShell>
  );
}

