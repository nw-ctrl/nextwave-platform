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
5. The portal entry and shell also had web-only usability gaps that Android does not have in the same way:
   - The login page still looked like the earlier plain form instead of the new branded light-blue medical layout.
   - Post-login actions such as sign-in, clinic switching, billing open, and sign-out still relied on full document reloads, which made navigation feel slower than necessary.
   - Prescription print could render the letterhead like a small image block instead of as a full-page background layer.

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
   - Updated the letterhead handling again so the prescription can use the doctor letterhead as a full-page background instead of a small thumbnail header block.
6. `apps/client-portal/app/page.tsx`
   - Reworked the unauthenticated landing page into a branded split-screen layout with the updated light-blue medical styling.
7. `apps/client-portal/components/portal-login-form.tsx`
   - Updated the login panel visuals and content blocks.
   - Replaced hard redirect behavior with router-based navigation after sign-in.
8. `apps/client-portal/components/portal-workspace-shell.tsx`
   - Replaced full page reloads for clinic selection, logout, and billing launch with router-driven transitions to improve perceived speed.

## Remaining Parity Gaps
1. Web templates page is still mostly a read/list experience, while Android prescription setup is profile-driven and more operational.
2. Web print output now respects the same stored doctor settings, but it is still an HTML print view, not a full clone of Android's `PdfGenerator`.
3. Android offline-first sync, background workers, and on-device print/share flows remain Android-only by design.
4. Wider feature parity still needs a documented checklist for:
   - dashboard sync/subscription status
   - clinic settings completeness
   - doctor management breadth
   - patient and visit read/write parity decisions
5. After the shell redirect fixes, the next performance pass should still inspect data-heavy dashboard and patient pages for server fetch duplication or unnecessary refreshes.

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
  - `apps/client-portal/app/page.tsx`
  - `apps/client-portal/components/portal-login-form.tsx`
  - `apps/client-portal/components/portal-workspace-shell.tsx`

## Working Rule Going Forward
For any MediVault doctor or prescription-print feature, treat Android profile fields in `profiles` as the primary contract. The web app should extend that same contract instead of creating a separate web-only template system.
