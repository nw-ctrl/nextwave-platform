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
  void patientId;

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
      <div className="grid gap-6">
        <div className="flex flex-col gap-4 rounded-[34px] border border-[#d9e2e8] bg-white p-6 shadow-[0_18px_48px_rgba(16,33,50,0.08)] md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Clinical Library</h3>
            <p className="mt-1 text-sm text-slate-500">Manage diagnosis and prescription templates in the same clinical card layout used across the portal.</p>
          </div>
          <Button className="h-11 rounded-[16px] bg-[#1bb8cf] px-6 text-white shadow-sm hover:bg-[#1297b0]">
            New Template
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {templates.length === 0 ? (
            <Card className="col-span-full rounded-[32px] border border-[#d9e2e8] bg-white p-20 text-center italic text-slate-500 shadow-sm">
              No templates found for this clinic.
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="overflow-hidden rounded-[32px] border border-[#d9e2e8] bg-white shadow-[0_15px_40px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#1297b0]">
                          <FileText className="size-5" />
                        </div>
                        <h4 className="text-xl font-bold tracking-tight text-slate-900">{template.name}</h4>
                        <Badge className="rounded-full border-none bg-[#e8f8fb] px-3 text-[10px] font-bold uppercase tracking-wider text-[#1297b0]">
                          {template.source === "clinic" ? "Custom" : "Built-in"}
                        </Badge>
                      </div>
                      <div className="rounded-2xl border border-[#d7eef1] bg-[#f8fbfc] p-4 text-sm leading-6 text-slate-600">
                        <p className="whitespace-pre-wrap">{template.diagnosis || "No diagnosis assigned"}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-8 pt-4">
                  <div className="rounded-[24px] border border-[#e6edf1] bg-white p-5 shadow-sm">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Prescription Content</p>
                    <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-900 italic">
                      {template.prescription || "Empty prescription body"}
                    </p>
                  </div>
                  {template.notes ? (
                    <div className="rounded-[20px] border border-[#e6edf1] bg-[#f8fbfc] px-5 py-4">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Internal Notes</p>
                      <p className="text-xs font-medium leading-relaxed text-slate-500">{template.notes}</p>
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
