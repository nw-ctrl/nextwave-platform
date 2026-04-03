import { notFound } from "next/navigation";
import { PrintVisitActions } from "@/components/print-visit-actions";
import { getPortalSession } from "@/lib/auth";
import { getPatientById, getVisitById, getDoctorProfile, getClinicBranding, getClinicProfile, listClinicTemplates } from "@/lib/clinical-data";

export const dynamic = "force-dynamic";

const TARGET_WIDTH_IN = 4;
const TARGET_HEIGHT_IN = 6;
const BASE_WIDTH_IN = 6;
const BASE_HEIGHT_IN = 8.5;
const SCALE_X = TARGET_WIDTH_IN / BASE_WIDTH_IN;
const SCALE_Y = TARGET_HEIGHT_IN / BASE_HEIGHT_IN;
const PAGE_MARGIN_PT = 18;
const PAGE_WIDTH_PT = BASE_WIDTH_IN * 72;
const PAGE_HEIGHT_PT = BASE_HEIGHT_IN * 72;
const CONTENT_WIDTH_PT = PAGE_WIDTH_PT - PAGE_MARGIN_PT * 2;

function formatDoctorName(name: string) {
  if (!name) return "Doctor";
  const trimmed = name.trim();
  if (trimmed.toLowerCase().startsWith("dr.") || trimmed.toLowerCase().startsWith("dr ")) return trimmed;
  return `Dr. ${trimmed}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function pickAgeLabel(patient: { age?: number | null; age_months?: number | null }) {
  if (patient.age != null && patient.age_months != null) return `${patient.age}Y ${patient.age_months}M`;
  if (patient.age != null) return `${patient.age}Y`;
  if (patient.age_months != null) return `${patient.age_months}M`;
  return null;
}

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
  const effectiveLetterhead = doctor?.letterhead_image_url || doctor?.header_path || branding?.logo_url || templateLogo || null;
  const effectiveHeader = doctor?.prescription_header || templateHeader || null;
  const effectiveFooter = doctor?.prescription_footer || templateFooter || null;
  const hasFullPageLetterhead = Boolean(effectiveLetterhead);
  const doctorDisplayName = formatDoctorName(doctor?.full_name || "");
  const patientAgeLabel = pickAgeLabel(patient);
  const dateLabel = formatDate(visit.visit_date);
  const reviewDateLabel = formatDate(visit.revisit_date);
  const baseFontSize = Math.min(Math.max(Number(doctor?.prescription_font_size ?? 14), 12), 24);
  const lineOffset = Math.min(Math.max(Number(doctor?.pdf_line_offset ?? 12), -220), 220);
  const dateOffset = Math.max(0, Number(doctor?.pdf_date_x ?? 140));
  const signatureOffset = Math.min(Math.max(Number(doctor?.pdf_signature_y ?? 150), 0), 320);
  const letterheadSafeTopPt = 220;
  const headerTopPt = hasFullPageLetterhead ? letterheadSafeTopPt : 96;
  const lineY = headerTopPt + lineOffset;
  const patientInfoTop = lineY + 12;
  const vitalsTop = patientInfoTop + 84;
  const subjectTop = vitalsTop + 48;
  const assessmentTop = subjectTop + (visit.subjective ? 72 : 0);
  const planTop = assessmentTop + (visit.assessment ? 64 : 24);
  const footerTop = effectiveFooter ? PAGE_HEIGHT_PT - 120 : PAGE_HEIGHT_PT - 30;
  const signatureTop = PAGE_HEIGHT_PT - signatureOffset;
  const cityLine = clinic?.address?.city ? `${clinic.address.city}, ${clinic.address.country || "PK"}` : "Electronic Health Record";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-8 print:px-0 print:py-0">
      <style>{`
        @media print {
          @page {
            size: 4in 6in;
            margin: 0;
          }

          body {
            margin: 0;
          }
        }
      `}</style>

      <div className="print:hidden">
        <PrintVisitActions />
      </div>

      <div className="mx-auto w-full max-w-[4.8in] rounded-[32px] border border-border/70 bg-white p-4 shadow-sm print:max-w-[4in] print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div
          className="relative overflow-hidden bg-white text-black print:overflow-hidden"
          style={{ width: `${TARGET_WIDTH_IN}in`, height: `${TARGET_HEIGHT_IN}in` }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: `${BASE_WIDTH_IN}in`,
              height: `${BASE_HEIGHT_IN}in`,
              transform: `scale(${SCALE_X}, ${SCALE_Y})`,
              transformOrigin: "top left",
            }}
          >
            {hasFullPageLetterhead ? (
              <img
                src={effectiveLetterhead ?? ""}
                alt="Prescription letterhead"
                className="absolute inset-0 h-full w-full object-fill"
              />
            ) : null}

            {!hasFullPageLetterhead ? (
              <div
                className="absolute"
                style={{
                  left: `${PAGE_MARGIN_PT}pt`,
                  top: "24pt",
                  width: `${CONTENT_WIDTH_PT}pt`,
                }}
              >
                <p className="text-[20pt] font-bold leading-none">{doctorDisplayName}</p>
                {doctor?.qualification ? <p className="mt-[8pt] text-[14pt] leading-tight">{doctor.qualification}</p> : null}
                {doctor?.pmdc_no ? <p className="mt-[4pt] text-[14pt] leading-tight">PMDC: {doctor.pmdc_no}</p> : null}
                <p className="mt-[6pt] text-[16pt] font-semibold leading-tight">{membership.clinicName}</p>
                {effectiveHeader ? (
                  <p className="mt-[8pt] whitespace-pre-wrap text-[14pt] leading-[1.25] text-neutral-700">{effectiveHeader}</p>
                ) : null}
              </div>
            ) : null}

            <div
              className="absolute"
              style={{
                left: `${PAGE_MARGIN_PT}pt`,
                right: `${PAGE_MARGIN_PT}pt`,
                top: `${lineY}pt`,
                borderTop: "1pt solid #111",
              }}
            />

            <div
              className="absolute"
              style={{
                left: `${PAGE_MARGIN_PT}pt`,
                top: `${patientInfoTop}pt`,
                width: `${CONTENT_WIDTH_PT}pt`,
                fontSize: `${baseFontSize}pt`,
                lineHeight: 1.25,
              }}
            >
              <div className="relative min-h-[60pt]">
                <p className="font-bold">Patient Name: <span className="font-semibold">{patient.full_name || "N/A"}</span></p>
                <p className="mt-[16pt]">Patient ID: <span className="font-normal">{patient.patient_code || "N/A"}</span></p>
                <p className="mt-[16pt]">Age / Sex: <span className="font-normal">{[patientAgeLabel, patient.sex].filter(Boolean).join(" / ") || "N/A"}</span></p>
                <p
                  className="absolute top-0 whitespace-nowrap"
                  style={{ right: `${dateOffset}pt` }}
                >
                  Date: {dateLabel}
                </p>
                {patient.phone_number ? (
                  <p
                    className="absolute whitespace-nowrap"
                    style={{ right: `${dateOffset}pt`, top: `${baseFontSize + 32}pt` }}
                  >
                    Phone: {patient.phone_number}
                  </p>
                ) : null}
              </div>
            </div>

            <div
              className="absolute"
              style={{
                left: `${PAGE_MARGIN_PT}pt`,
                top: `${vitalsTop}pt`,
                width: `${CONTENT_WIDTH_PT}pt`,
                fontSize: `${baseFontSize}pt`,
                lineHeight: 1.25,
              }}
            >
              {!visit.bp && !visit.temp && !visit.weight ? null : (
                <>
                  <p className="text-[16pt] font-bold">VITALS</p>
                  <p className="mt-[8pt] text-neutral-700">
                    {[visit.bp ? `BP: ${visit.bp} mmHg` : null, visit.temp ? `Temp: ${visit.temp} F` : null, visit.weight ? `Weight: ${visit.weight} kg` : null]
                      .filter(Boolean)
                      .join("   ")}
                  </p>
                </>
              )}
            </div>

            {visit.subjective ? (
              <section
                className="absolute"
                style={{
                  left: `${PAGE_MARGIN_PT}pt`,
                  top: `${subjectTop}pt`,
                  width: `${CONTENT_WIDTH_PT}pt`,
                  fontSize: `${baseFontSize}pt`,
                  lineHeight: 1.35,
                }}
              >
                <p className="text-[16pt] font-bold">CHIEF COMPLAINTS</p>
                <p className="mt-[8pt] whitespace-pre-wrap text-neutral-700">{visit.subjective}</p>
              </section>
            ) : null}

            {visit.assessment ? (
              <section
                className="absolute"
                style={{
                  left: `${PAGE_MARGIN_PT}pt`,
                  top: `${assessmentTop}pt`,
                  width: `${CONTENT_WIDTH_PT}pt`,
                  fontSize: `${baseFontSize}pt`,
                  lineHeight: 1.35,
                }}
              >
                <p className="text-[16pt] font-bold">DIAGNOSIS</p>
                <p className="mt-[8pt] whitespace-pre-wrap font-semibold text-neutral-800">{visit.assessment}</p>
              </section>
            ) : null}

            <section
              className="absolute"
              style={{
                left: `${PAGE_MARGIN_PT}pt`,
                top: `${planTop}pt`,
                width: `${CONTENT_WIDTH_PT}pt`,
                maxHeight: `${Math.max(72, footerTop - planTop - 32)}pt`,
                overflow: "hidden",
                fontSize: `${baseFontSize}pt`,
                lineHeight: 1.45,
              }}
            >
              <p className="text-[16pt] font-bold">Rx / TREATMENT PLAN</p>
              <p className="mt-[8pt] whitespace-pre-wrap text-neutral-700">{visit.plan || "No specific treatment mentioned."}</p>
              {visit.revisit_date ? <p className="mt-[12pt] font-semibold">Follow up on: {reviewDateLabel}</p> : null}
            </section>

            {effectiveFooter ? (
              <div
                className="absolute"
                style={{
                  left: `${PAGE_MARGIN_PT}pt`,
                  top: `${footerTop}pt`,
                  width: `${CONTENT_WIDTH_PT}pt`,
                  fontSize: `${baseFontSize}pt`,
                  lineHeight: 1.25,
                }}
              >
                <div className="border-t border-black" />
                <p className="mt-[10pt] whitespace-pre-wrap text-neutral-700">{effectiveFooter}</p>
              </div>
            ) : (
              <p
                className="absolute text-[10pt] text-neutral-400"
                style={{ left: `${PAGE_MARGIN_PT}pt`, top: `${footerTop}pt` }}
              >
                Generated by MediVault Pro
              </p>
            )}

            <div
              className="absolute"
              style={{
                left: `${PAGE_WIDTH_PT - PAGE_MARGIN_PT - 150}pt`,
                top: `${signatureTop}pt`,
                width: "150pt",
                fontSize: `${baseFontSize}pt`,
                lineHeight: 1.2,
              }}
            >
              <p>____________________</p>
              <p className="mt-[6pt] italic font-semibold">{doctorDisplayName}</p>
              {doctor?.qualification ? <p className="mt-[4pt] text-neutral-700">{doctor.qualification}</p> : null}
              {doctor?.pmdc_no ? <p className="mt-[4pt] text-neutral-700">PMDC: {doctor.pmdc_no}</p> : null}
            </div>

            {!hasFullPageLetterhead ? (
              <div
                className="absolute"
                style={{
                  right: `${PAGE_MARGIN_PT}pt`,
                  top: "24pt",
                  textAlign: "right",
                  width: "220pt",
                }}
              >
                <p className="text-[16pt] font-semibold">{membership.clinicName}</p>
                <p className="mt-[4pt] text-[12pt] text-neutral-700">{cityLine}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
