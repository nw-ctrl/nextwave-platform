import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PrintVisitActions } from "@/components/print-visit-actions";
import { getPortalSession } from "@/lib/auth";
import { getPatientById, getVisitById, getDoctorProfile, getClinicBranding, getClinicProfile, listClinicTemplates } from "@/lib/clinical-data";

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
  const branding = await getClinicBranding(membership.clientId);
  const clinic = await getClinicProfile(membership.clientId);
  const templates = await listClinicTemplates(membership.clientId);

  const letterheadTemplate = templates.find((template) =>
    template.name.toLowerCase().includes("letter") ||
    template.name.toLowerCase().includes("head") ||
    template.name.toLowerCase().includes("pad")
  );

  const templateLogo = letterheadTemplate?.payload?.logoUrl || letterheadTemplate?.payload?.imageUrl;
  const templateHeader = letterheadTemplate?.payload?.headerText;
  const templateFooter = letterheadTemplate?.payload?.footerText;
  const prescriptionFontSize = doctor?.prescription_font_size ?? 14;
  const effectiveLetterhead = doctor?.letterhead_image_url || doctor?.header_path || branding?.logo_url || templateLogo || null;
  const effectiveHeader = doctor?.prescription_header || templateHeader || null;
  const effectiveFooter = doctor?.prescription_footer || templateFooter || null;
  const hasFullPageLetterhead = Boolean(effectiveLetterhead);
  const dateOffset = Math.max(0, doctor?.pdf_date_x ?? 140);
  const contentTopPadding = Math.max(hasFullPageLetterhead ? 110 : 24, (hasFullPageLetterhead ? 110 : 24) + (doctor?.pdf_line_offset ?? 12) * 0.25);
  const signatureTopMargin = Math.max(48, (doctor?.pdf_signature_y ?? 150) * 0.35);

  const formatDrName = (name: string) => {
    if (!name) return "Doctor";
    const trimmed = name.trim();
    if (trimmed.toLowerCase().startsWith("dr.") || trimmed.toLowerCase().startsWith("dr ")) return trimmed;
    return `Dr. ${trimmed}`;
  };

  const doctorDisplayName = formatDrName(doctor?.full_name || "");
  const patientAgeLabel =
    patient.age != null && patient.age_months != null
      ? `${patient.age}Y ${patient.age_months}M`
      : patient.age != null
        ? `${patient.age}Y`
        : patient.age_months != null
          ? `${patient.age_months}M`
          : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-8 print:px-0 print:py-0">
      <style>{`
        @media print {
          @page {
            size: 4in 6in;
            margin: 0.18in;
          }
        }
      `}</style>
      <div className="print:hidden"><PrintVisitActions /></div>
      <Card className="relative overflow-hidden rounded-[32px] border-border/70 shadow-sm print:mx-auto print:max-w-[4in] print:rounded-none print:border-0 print:shadow-none">
        {hasFullPageLetterhead ? (
          <div className="pointer-events-none absolute inset-0 z-0">
            <img src={effectiveLetterhead ?? ""} alt="Prescription background" className="h-full w-full object-fill" />
          </div>
        ) : null}

        <div className={`relative z-10 flex items-center ${hasFullPageLetterhead ? "min-h-[140px] p-8 print:p-0 print:border-0" : "min-h-[140px] border-b border-border/40 bg-primary/5 p-8 print:border-0 print:bg-white print:p-0"}`}>
          <div className="flex w-full justify-between items-start gap-8">
            <div className="flex-1">
              {!hasFullPageLetterhead ? <h1 className="mb-1 text-3xl font-bold tracking-tight text-primary print:text-black">{doctorDisplayName}</h1> : null}
              <p className="text-sm font-semibold opacity-80">{doctor?.qualification || "General Physician"}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest opacity-60">PMDC: {doctor?.pmdc_no || "N/A"}</p>
              {effectiveHeader && !hasFullPageLetterhead ? <p className="mt-3 max-w-sm whitespace-pre-wrap text-xs font-medium leading-relaxed text-muted-foreground">{effectiveHeader}</p> : null}
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold tracking-tight">{membership.clinicName}</h2>
              <p className="text-xs text-muted-foreground opacity-70">{clinic?.address?.city ? `${clinic.address.city}, ${clinic.address.country || "PK"}` : "Electronic Health Record"}</p>
            </div>
          </div>
        </div>

        <CardContent className="relative z-10 space-y-8 p-8 text-sm leading-7 text-foreground print:p-0 print:pt-6" style={{ fontSize: `${prescriptionFontSize}px` }}>
          <section className="grid gap-6 border-b border-border/40 pb-6 print:border-black/10 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Patient Details</p>
              <p className="text-lg font-bold">{patient.full_name}</p>
              <p className="text-xs font-medium opacity-70">{[patient.sex, patientAgeLabel, patient.patient_code].filter(Boolean).join(" | ")}</p>
            </div>
            <div className="space-y-1 md:text-right" style={{ paddingRight: `${Math.max(0, dateOffset - 100) * 0.35}px` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Visit Date</p>
              <p className="text-lg font-bold">{visit.visit_date || "Not recorded"}</p>
              {visit.revisit_date ? <p className="text-xs font-medium text-primary">Review Date: {visit.revisit_date}</p> : null}
            </div>
          </section>

          <div className="grid grid-cols-[140px_1fr] gap-8 print:grid-cols-[120px_1fr]">
            <aside className="space-y-6">
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Vitals</p>
                <div className="space-y-4">
                  <div><p className="text-[10px] font-bold uppercase opacity-30">BP</p><p className="font-bold">{visit.bp || "-"}</p></div>
                  <div><p className="text-[10px] font-bold uppercase opacity-30">Temp</p><p className="font-bold">{visit.temp || "-"}</p></div>
                  <div><p className="text-[10px] font-bold uppercase opacity-30">Weight</p><p className="font-bold">{visit.weight || "-"}</p></div>
                </div>
              </div>
            </aside>

            <div className="min-w-0 space-y-8">
              {visit.subjective ? (
                <section>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Subjective / Complaints</p>
                  <p className="whitespace-pre-wrap">{visit.subjective}</p>
                </section>
              ) : null}

              <section>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Diagnosis / Assessment</p>
                <p className="whitespace-pre-wrap text-xl font-bold tracking-tight text-primary print:text-black">{visit.assessment || "Clinical Assessment"}</p>
              </section>

              <section className="min-h-[300px] border-t border-border/40 print:border-black/5" style={{ paddingTop: `${contentTopPadding}px` }}>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Prescription / Treatment Plan</p>
                <div className="whitespace-pre-wrap font-medium italic leading-relaxed text-foreground" style={{ fontSize: `${prescriptionFontSize}px` }}>
                  {visit.plan || "Observation and general care."}
                </div>
              </section>
            </div>
          </div>

          <div className="flex items-end justify-between border-t border-border/40 pt-6 print:border-black/5" style={{ marginTop: `${signatureTopMargin}px` }}>
            <div className="max-w-md">
              {effectiveFooter ? <p className="whitespace-pre-wrap text-xs italic leading-5 text-muted-foreground">{effectiveFooter}</p> : null}
            </div>
            <div className="w-48 text-center">
              <p className="text-[10px] font-bold uppercase opacity-40">Digital Signature</p>
              <p className="mt-1 text-sm font-bold">{doctorDisplayName}</p>
            </div>
          </div>
        </CardContent>

        <div className={`relative z-10 p-4 text-center text-[10px] text-muted-foreground print:mt-10 print:bg-transparent ${hasFullPageLetterhead ? "" : "bg-muted/30"}`}>
          Powered by MediVault Dashboard | {new Date().toLocaleDateString()}
        </div>
      </Card>
    </main>
  );
}
