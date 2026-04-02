# MediVault Web Parity Progress

Date: 2026-04-03

## Scope Reviewed
- Web app: `apps/client-portal` in `nextwave-platform`
- Android app: `C:\N\Projects\Android Projects\Coginitive Grid\MediVault Pro`

## Audit Findings
1. Android remains the richer clinical client. It already owns local-first visit capture, sync queue behavior, doctor prescription settings, letterhead upload, and 4x6 prescription PDF layout controls.
2. The web app already had patient, visit, template, and doctor routes, but doctor print configuration was only partially wired.
3. The main parity gap was doctor prescription settings:
   - Android uses `profiles` as the source of truth for `prescription_header`, `prescription_footer`, `letterhead_image_path`, `pdf_line_offset`, `pdf_signature_y`, `pdf_date_x`, and `prescription_font_size`.
   - Web was only exposing part of that model and the print page still guessed at letterhead templates instead of consistently using the doctor profile first.
4. The web doctor editor was also missing `pdf_date_x` and practical letterhead handling, which made Android-configured print settings hard to discover or verify on web.

## Changes Applied In Web Repo
1. `apps/client-portal/lib/clinical-data.ts`
   - Extended doctor profile mapping with `letterhead_image_path`, `letterhead_image_url`, and `pdf_date_x`.
   - Added public URL resolution for the `letterheads` storage bucket so web can render the same stored asset Android uses.
2. `apps/client-portal/app/(modules)/doctors/actions.ts`
   - Normalized doctor profile updates around the Android profile contract.
   - Added letterhead upload action to `letterheads`.
   - Kept `doctor_profiles` in sync as a compatibility layer for older web reads.
3. `apps/client-portal/app/(modules)/doctors/page.tsx`
   - Switched to the merged doctor profile loader instead of reading raw `profiles` only.
4. `apps/client-portal/app/(modules)/doctors/doctor-profile-form.tsx`
   - Added letterhead upload and preview.
   - Added stored letterhead path visibility.
   - Added `pdf_date_x`.
   - Changed header and footer inputs to multi-line text areas to better match Android content.
5. `apps/client-portal/app/(modules)/patients/[patientId]/visits/[visitId]/print/page.tsx`
   - Changed the print surface to prefer the doctor's own synced letterhead/settings before template fallbacks.
   - Applied doctor print settings for font sizing and rough layout tuning.
   - Added 4x6 print page sizing.
   - Improved age rendering to include months when available.

## Remaining Parity Gaps
1. Web templates page is still mostly a read/list experience, while Android prescription setup is profile-driven and more operational.
2. Web print output now respects the same stored doctor settings, but it is still an HTML print view, not a full clone of Android's `PdfGenerator`.
3. Android offline-first sync, background workers, and on-device print/share flows remain Android-only by design.
4. Wider feature parity still needs a documented checklist for:
   - dashboard sync/subscription status
   - clinic settings completeness
   - doctor management breadth
   - patient and visit read/write parity decisions

## Source Files Confirmed During Audit
- Android:
  - `app/src/main/java/com/healthsynclabs/medivault/viewmodel/ProfileViewModel.kt`
  - `app/src/main/java/com/healthsynclabs/medivault/screens/PrescriptionSettingsScreen.kt`
  - `app/src/main/java/com/healthsynclabs/medivault/utils/PdfGenerator.kt`
  - `app/src/main/java/com/healthsynclabs/medivault/repo/SupabaseRepo.kt`
- Web:
  - `apps/client-portal/app/(modules)/doctors/page.tsx`
  - `apps/client-portal/app/(modules)/doctors/doctor-profile-form.tsx`
  - `apps/client-portal/app/(modules)/doctors/actions.ts`
  - `apps/client-portal/lib/clinical-data.ts`
  - `apps/client-portal/app/(modules)/patients/[patientId]/visits/[visitId]/print/page.tsx`

## Working Rule Going Forward
For any MediVault doctor or prescription-print feature, treat Android profile fields in `profiles` as the primary contract. The web app should extend that same contract instead of creating a separate web-only template system.
