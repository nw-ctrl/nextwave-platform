# Deployment Targets

- Website: `nextwave.au`
- Admin: `admin.nextwave.au`
- Clinic portals: `clinicname.nextwave.au`

## Vercel Projects

1. Create project `nextwave-website` with root directory `apps/website`.
2. Create project `nextwave-admin-dashboard` with root directory `apps/admin-dashboard`.
3. Create project `nextwave-client-portal` with root directory `apps/client-portal`.
4. Framework preset for all: `Next.js`.
5. Install command: `corepack pnpm install`.
6. Build command: `corepack pnpm build`.

## Domain Mapping

1. `nextwave.au` and `www.nextwave.au` -> `nextwave-website`.
2. `admin.nextwave.au` -> `nextwave-admin-dashboard`.
3. `*.nextwave.au` (wildcard) -> `nextwave-client-portal`.
4. Add explicit `clinicname.nextwave.au` test domain to validate wildcard routing.

## Environment Variables

1. Configure vars from `/.env.vercel.example` in each Vercel project.
2. Keep sensitive keys only in Vercel env, not in repository.
3. Ensure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set for admin and portal apps.
4. Stripe setup and release checklist: `docs/stripe-setup.md`

## Wildcard Tenant Routing

1. `apps/client-portal/middleware.ts` injects `x-tenant-slug` from host.
2. Portal pages can resolve tenant identity from header (for example `clinicname.nextwave.au` -> `clinicname`).

## Medivault Weekend Release Checklist

1. Admin billing flow lives at `admin.nextwave.au/billing` and should be used for onboarded clinics only.
2. Configure production Stripe variables in the admin Vercel project:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
   - `STRIPE_MEDIVAULT_MONTHLY_PRICE_ID=price_...`
   - `NEXT_PUBLIC_ADMIN_URL=https://admin.nextwave.au`
3. Create one live recurring Stripe price for Medivault:
   - currency: `PKR`
   - amount: `4000`
   - interval: monthly
4. In Stripe live mode, create webhook endpoint:
   - URL: `https://admin.nextwave.au/api/stripe/webhook`
   - events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
5. Verify at least one real Medivault clinic has a clean `client`-mode billing profile before go-live.
6. Test one final checkout in Stripe test mode before switching production envs to live values.
7. After release, run one monitored live clinic checkout and verify webhook delivery and subscription status.

## Current Progress

### 2026-03-21

1. First live Medivault clinic subscription completed successfully through Stripe checkout with discount flow applied.
2. Client portal billing view was corrected to read live Stripe subscription and invoice data instead of showing the raw stored `price_...` identifier as the subscribed package.
3. Added a Stripe billing portal entrypoint inside the client portal so clinics can manage payment method, invoices, and future subscription changes safely.
4. Upgraded the billing page UI with a fixed operational clinic header, clearer current-plan summary, billing history, and next-cycle upgrade guidance.
5. Follow-up still required: normalize webhook-synced subscription labels in shared data storage so admin and downstream views use the same human-readable plan names.
