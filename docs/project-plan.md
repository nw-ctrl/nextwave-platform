# NextWave Project Plan

Last updated: 2026-03-12
Owner: Codex + project workspace

## Purpose

This file is the source of truth for:
- current project status
- active implementation plan
- blockers and assumptions
- dated progress updates as work continues

All future planning and progress updates should be recorded here.

## Current Repository Status

The repository is a working monorepo scaffold with three apps and shared packages:
- `apps/website`
- `apps/admin-dashboard`
- `apps/client-portal`
- shared packages for config, auth, database, analytics, and UI

### Implemented

- Marketing website structure and content are in place.
- Admin dashboard API surface exists for:
  - access control
  - audit trail
  - account administration
  - GitHub connections and repository sync
  - tenant branding and feature flags
  - database connection management
  - billing profiles
  - Stripe webhook ingestion
  - analytics ingest
- Client portal tenant routing and access checks are wired.
- Supabase schema and service-client access exist.
- Deployment documentation exists for Vercel and wildcard tenant routing.
- Stripe setup documentation exists for platform and clinic billing.
- Website Stripe checkout proof-of-wiring exists.
- Medivault admin billing flow now exists and works locally end to end.

### Partially Implemented

- `apps/admin-dashboard` UI is operational but still mostly utility/admin screens.
- `apps/client-portal` UI is mostly scaffolded with placeholder module pages.
- Build and deployment configuration has been prepared, but deployment has not yet been verified end to end.
- Android app finalization and production release work are still pending.

### Current Build State

Build verification is confirmed with one environment caveat:
- root `typecheck` passes
- root `build` passes
- in this shell, Turbo requires a discoverable `pnpm` shim on `PATH`
- Next.js production builds fail inside the default sandbox with `spawn EPERM`, but succeed outside the sandbox

## Active Plan

### Phase 1: Stabilize Local Build

Status: Completed

### Phase 2: Stripe Setup and Verification

Status: Completed for local Medivault test flow

Completed:
- audited Stripe code paths and environment templates
- verified local website checkout flow
- implemented clinic-specific Medivault admin checkout flow
- cleaned and reseeded one Medivault clinic billing path for testing
- completed successful local Medivault checkout
- confirmed webhook delivery with HTTP 200 for all relevant events after hardening

Remaining production tasks:
- create live Stripe PKR monthly price for Medivault
- configure production Stripe webhook for `admin.nextwave.au`
- set live admin Vercel env vars
- run one monitored live clinic checkout after deployment

### Phase 3: Admin Dashboard Completion

Status: In progress

Tasks:
- polish the billing page UI after production readiness is locked
- review authz enforcement across admin write paths
- add any missing validation or operational messaging needed for release

### Phase 4: MediVault Client Portal Integration

Status: Active

Tasks:
- [ ] Implement tiered pricing UI (Basic, Standard, Premium) with early adopter discounts.
- [ ] Build "Plan Status Card" with "Founding Doctor" branding for the dashboard.
- [ ] Enhance billing settings with upsell prompts and history tracking.
- [ ] Connect "Manage Subscription" to Stripe Customer Portal.
- [ ] Integrate superuser controls in `admin-dashboard` for discount code and client management.

### Phase 5: Deployment Readiness

Status: In progress

Tasks:
- [ ] Finalize production Stripe cutover (live PRICE_IDs and webhooks).
- [ ] Validate Vercel wildcard routing for `apps.nextwave.au`.
- [ ] Verify production environments for all three apps.

## Immediate Next Actions

1. Implement Billing & Tiered Pricing components in `apps/client-portal`.
2. Configure live Stripe PKR prices for the for Basic, Standard, and Premium tiers.
3. Build Superuser Discount Management in `apps/admin-dashboard`.

## Known Good Medivault Test Path

- clinic: `NW2 Test Clinic`
- `clientId`: `da6b4065-2dd6-4bd2-99c4-9aa93ce0b78f`
- admin actor: `a8d9dfbb-62dd-406c-b6cd-fa352780c2b9`
- billing amount: `PKR 4000/month`

## Open Blockers

- Production Stripe live cutover is not yet completed.
- Android app release work is still pending.
- Admin UI polish is deferred until after production readiness.

## Progress Log

### 2026-03-14

- Defined MediVault-specific 3-tier pricing model (Basic, Standard, Premium).
- Designed "Founding Doctor" exclusivity branding and early adopter pricing logic.
- Planned Client Portal (`apps.nextwave.au/medivault`) enhancements including Plan Status Card and Billing Hub.
- Mapped Superuser management requirements for `admin.nextwave.au` (discount codes and access control).
- Created `docs/medivault-integration.md` as the detailed reference for clinical portal requirements.


### 2026-03-12

- Implemented a real client portal sign-in flow using Supabase email/password with secure portal cookies.
- Added clinic selection from `user_client_memberships` so portal context no longer depends on `userId` and `clientId` URL params.
- Updated the client portal billing flow to derive clinic and user from the authenticated session.
- Verified `@nextwave/client-portal` typecheck passes.
- Verified `@nextwave/client-portal` production build passes.
- Completed successful local Medivault admin checkout testing.
- Verified Stripe Checkout completed for the admin-triggered clinic billing flow.
- Verified local webhook delivery returned HTTP 200 for `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `invoice.paid` after hardening.
- Cleaned and reseeded billing data for one Medivault clinic test path.
- Added production cutover and weekend release guidance to deployment and Stripe docs.

### 2026-03-11

- Reviewed repository structure, docs, and recent commit history.
- Confirmed there was no single persistent plan file before this entry.
- Identified the current implementation split:
  - website is the most complete user-facing app
  - admin dashboard has meaningful backend and API coverage
  - client portal is scaffolded with access-control wiring
- Created this file as the single ongoing plan and progress record.
- Confirmed `corepack` works but `pnpm` is not exposed on `PATH` in the default shell.
- Created a repo-local `.corepack` shim directory so Turbo can discover `pnpm`.
- Verified root `typecheck` passes when `.corepack` is added to `PATH`.
- Verified root `build` passes outside sandbox restrictions; the prior `next build` `spawn EPERM` failure was environmental, not an app-code build failure.
- Marked Stripe setup and verification as the active next workstream.
- Implemented website Stripe checkout proof-of-wiring.
- Implemented Medivault admin billing flow foundations.

