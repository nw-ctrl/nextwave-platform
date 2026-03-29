import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PrintVisitActions } from "@/components/print-visit-actions";
import { getPortalSession } from "@/lib/auth";
import { getPatientById, getVisitById, getDoctorProfile } from "@/lib/clinical-data";

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

  const doctor = await getDoctorProfile(membership.clientId, visit.doctor_id);

  const formatDrName = (name: string) => {
    if (!name) return "Doctor";
    const trimmed = name.trim();
    if (trimmed.toLowerCase().startsWith("dr.") || trimmed.toLowerCase().startsWith("dr ")) {
      return trimmed;
    }
    return `Dr. ${trimmed}`;
  };

  const doctorDisplayName = formatDrName(doctor?.full_name || "");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-8 print:px-0 print:py-0">
      <div className="print:hidden"><PrintVisitActions /></div>
      <Card className="rounded-[32px] border-border/70 shadow-sm print:rounded-none print:border-0 print:shadow-none overflow-hidden">
        {/* Prescription Header */}
        <div className="bg-primary/5 p-8 border-b border-border/40 print:bg-white print:p-0 print:border-0">
             <div className="flex justify-between items-start gap-8">
                <div>
                   <h1 className="text-3xl font-bold tracking-tight text-primary print:text-black">{doctorDisplayName}</h1>
                   <p className="text-sm font-semibold opacity-70">{doctor?.qualification || "General Physician"}</p>
                   <p className="text-xs uppercase tracking-widest opacity-50 font-bold mt-1">PMDC: {doctor?.pmdc_no || "N/A"}</p>
                </div>
                <div className="text-right">
                   <h2 className="text-xl font-bold tracking-tight">{membership.clinicName}</h2>
                   <p className="text-xs text-muted-foreground opacity-70">Electronic Health Record</p>
                </div>
             </div>
        </div>

        <CardContent className="p-8 space-y-8 text-sm leading-7 text-foreground print:p-0 print:pt-6">
          <section className="grid gap-6 md:grid-cols-2 border-b border-border/40 pb-6 print:border-black/10">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Patient Details</p>
              <p className="text-lg font-bold">{patient.full_name}</p>
              <p className="text-xs font-medium opacity-70">{[patient.sex, patient.age != null ? `${patient.age}Y` : null, patient.patient_code].filter(Boolean).join(" • ")}</p>
            </div>
            <div className="md:text-right space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Visit Date</p>
              <p className="text-lg font-bold">{visit.visit_date || "Not recorded"}</p>
              {visit.revisit_date ? <p className="text-xs font-medium text-primary">Review Date: {visit.revisit_date}</p> : null}
            </div>
          </section>

          <div className="grid grid-cols-[140px_1fr] gap-8 print:grid-cols-[120px_1fr]">
              <aside className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 mb-3">Vitals</p>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase opacity-30">BP</p>
                            <p className="font-bold">{visit.bp || "-"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase opacity-30">Temp</p>
                            <p className="font-bold">{visit.temp || "-"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase opacity-30">Weight</p>
                            <p className="font-bold">{visit.weight || "-"}</p>
                        </div>
                    </div>
                  </div>
              </aside>

              <div className="space-y-8 min-w-0">
                  {visit.subjective ? (
                    <section>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 mb-2">Subjective / Complaints</p>
                      <p className="whitespace-pre-wrap">{visit.subjective}</p>
                    </section>
                  ) : null}

                  <section>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 mb-2">Diagnosis / Assessment</p>
                    <p className="whitespace-pre-wrap text-xl font-bold tracking-tight text-primary print:text-black">{visit.assessment || "Clinical Assessment"}</p>
                  </section>

                  <section className="min-h-[300px] border-t border-border/40 pt-6 print:border-black/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 mb-4">Prescription / Treatment Plan</p>
                    <div className="text-base font-medium leading-relaxed whitespace-pre-wrap text-foreground italic">
                        {visit.plan || "Observation and general care."}
                    </div>
                  </section>
              </div>
          </div>
          
          <div className="mt-12 flex justify-end">
                <div className="text-center w-48 pt-4 border-t border-border/40 print:border-black/10">
                    <p className="text-[10px] font-bold uppercase opacity-40">Digital Signature</p>
                    <p className="text-sm font-bold mt-1">{doctorDisplayName}</p>
                </div>
          </div>
        </CardContent>
        
        <div className="bg-muted/30 p-4 text-[10px] text-center text-muted-foreground print:bg-transparent print:mt-10">
            Powered by MediVault Dashboard • {new Date().toLocaleDateString()}
        </div>
      </Card>
    </main>
  );
}
