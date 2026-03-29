import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintVisitActions } from "@/components/print-visit-actions";
import { getPortalSession } from "@/lib/auth";
import { getPatientById, getVisitById } from "@/lib/clinical-data";

export const dynamic = "force-dynamic";

export default async function PrintVisitPage({ params }: { params: Promise<{ patientId: string; visitId: string }> }) {
  const { patientId, visitId } = await params;
  const session = await getPortalSession();

  if (!session) {
    notFound();
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const patient = await getPatientById(membership.clientId, patientId);
  const visit = await getVisitById(membership.clientId, patientId, visitId);

  if (!patient || !visit) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-8 print:px-0 print:py-0">
      <div className="print:hidden"><PrintVisitActions /></div>
      <Card className="rounded-[32px] border-border/70 shadow-sm print:rounded-none print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle className="text-3xl">Prescription print view</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-sm leading-7 text-foreground">
          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Patient</p>
              <p className="mt-2 text-lg font-semibold">{patient.full_name}</p>
              <p className="text-muted-foreground">{[patient.sex, patient.age != null ? `${patient.age} years` : null, patient.phone_number].filter(Boolean).join(" • ")}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Visit date</p>
              <p className="mt-2 text-lg font-semibold">{visit.visit_date || "Not recorded"}</p>
              {visit.revisit_date ? <p className="text-muted-foreground">Review: {visit.revisit_date}</p> : null}
            </div>
          </section>

          {visit.subjective ? (
            <section>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subjective</p>
              <p className="mt-3 whitespace-pre-wrap">{visit.subjective}</p>
            </section>
          ) : null}

          <section>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Diagnosis</p>
            <p className="mt-3 whitespace-pre-wrap text-lg font-medium">{visit.assessment || "Clinical visit"}</p>
          </section>

          <section>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Prescription and plan</p>
            <p className="mt-3 whitespace-pre-wrap">{visit.plan || "No prescription text recorded."}</p>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 px-4 py-3"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">BP</p><p className="mt-2 font-medium">{visit.bp || "-"}</p></div>
            <div className="rounded-2xl border border-border/70 px-4 py-3"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Temperature</p><p className="mt-2 font-medium">{visit.temp || "-"}</p></div>
            <div className="rounded-2xl border border-border/70 px-4 py-3"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Weight</p><p className="mt-2 font-medium">{visit.weight || "-"}</p></div>
          </section>
        </CardContent>
      </Card>
    </main>
  );
}

