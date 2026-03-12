# Stripe Setup (Platform + Per-Project)

This runbook defines exactly which Stripe key goes where, and how to separate:
- platform offers (main website, enterprise/general subscriptions)
- per-client project subscriptions (each customer/project can have its own Stripe config)

## 1) Key Types (Do Not Mix)

- `sk_test_...` / `sk_live_...`:
  Stripe secret key. Server-side only. Used to call Stripe API.
- `pk_test_...` / `pk_live_...`:
  Stripe publishable key. Frontend-safe. Used by Stripe.js and Checkout UI only.
- `whsec_...`:
  Webhook signing secret. Used only to verify `stripe-signature` headers.
- `price_...`:
  Stripe price id. Not a secret. Used when creating subscription checkout sessions.
- `acct_...`:
  Stripe Connect account id (optional, when billing is tied to a connected account).

There is no separate webhook API key. Webhook verification uses `whsec_...`, not `sk_...`.

## 2) Where Keys Are Used In This Repo

- Admin Dashboard backend:
  - Endpoint: `POST /api/stripe/webhook`
  - Uses `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and billing profile refs (`key_ref`, `webhook_secret_ref`)
- Billing profile API:
  - Endpoint: `GET /api/billing/profiles` and `POST /api/billing/profiles`
  - Stores per-client Stripe key references, not raw keys
- Subscription status API:
  - Endpoint: `GET /api/subscription-status?clientId=...` or `?customerId=...`
- Website checkout flow:
  - Endpoint: `POST /api/stripe/checkout`
  - Uses `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PLATFORM_PRICE_ID`, and `STRIPE_PLATFORM_CLIENT_ID`
- Medivault admin checkout flow:
  - Endpoint: `POST /api/billing/checkout`
  - Uses `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_MEDIVAULT_MONTHLY_PRICE_ID`, and `NEXT_PUBLIC_ADMIN_URL`
  - Reuses or creates the clinic Stripe customer and stores `stripe_customer_id` in the clinic billing profile
  - Writes `clientId` and `appId=medivault` into Stripe subscription metadata for webhook-side mapping
- Website and Client Portal frontends:
  - Should use publishable key (`pk_...`) and price ids only
  - Never use `sk_...` or `whsec_...` in frontend code

## 3) Environment Separation (Test vs Live)

- Use Stripe test mode for local, dev, and preview.
- Use Stripe live mode only in production.
- Never mix test secrets with live webhook secrets in the same deployment.
- Recommended Vercel mapping:
  - Preview env -> test keys
  - Production env -> live keys

## 4) Billing Profile Model (Per Project / Per Client)

Each Stripe setup is attached to a `billing_profiles` row (`client_id` + `provider=stripe` + `mode`).

- `mode = "platform"`:
  Use for platform-level offers.
- `mode = "client"`:
  Use for clinic and project-specific subscriptions.

For Medivault release:
- each onboarded clinic should use a `client`-mode billing profile
- `stripe_customer_id` should be written automatically by the admin checkout flow if missing
- `key_ref` and `webhook_secret_ref` can remain global for now:
  - `env:STRIPE_SECRET_KEY`
  - `env:STRIPE_WEBHOOK_SECRET`

## 5) Recommended Env Variable Naming

Global fallback keys already used in code:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PLATFORM_PRICE_ID`
- `STRIPE_PLATFORM_CLIENT_ID`
- `STRIPE_MEDIVAULT_MONTHLY_PRICE_ID`

Scoped keys for billing profile refs:
- `STRIPE_SECRET_KEY_PLATFORM_TEST`
- `STRIPE_WEBHOOK_SECRET_PLATFORM_TEST`
- `STRIPE_SECRET_KEY_PLATFORM_LIVE`
- `STRIPE_WEBHOOK_SECRET_PLATFORM_LIVE`
- `STRIPE_SECRET_KEY_CLIENT_<CLIENTCODE>_TEST`
- `STRIPE_WEBHOOK_SECRET_CLIENT_<CLIENTCODE>_TEST`
- `STRIPE_SECRET_KEY_CLIENT_<CLIENTCODE>_LIVE`
- `STRIPE_WEBHOOK_SECRET_CLIENT_<CLIENTCODE>_LIVE`

## 6) Local Working Medivault Test Setup

Known-good clinic test path:
- clinic: `NW2 Test Clinic`
- `clientId`: `da6b4065-2dd6-4bd2-99c4-9aa93ce0b78f`
- valid admin actor: `a8d9dfbb-62dd-406c-b6cd-fa352780c2b9`

Local admin env in `apps/admin-dashboard/.env.local`:
- `STRIPE_SECRET_KEY=sk_test_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `STRIPE_MEDIVAULT_MONTHLY_PRICE_ID=price_...`
- `NEXT_PUBLIC_ADMIN_URL=http://localhost:3001`

Test flow:
1. Start apps locally.
2. Run `stripe listen --forward-to http://localhost:3001/api/stripe/webhook`.
3. Open `http://localhost:3001/billing`.
4. Start Medivault checkout with the admin actor id and clinic client id.
5. Complete checkout with Stripe test card `4242 4242 4242 4242`.
6. Confirm webhook events return HTTP 200, especially:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.paid`

## 7) Production Cutover For Weekend Release

1. In Stripe live mode, create a recurring Medivault price:
   - currency: `PKR`
   - amount: `4000`
   - interval: monthly
2. In Stripe live mode, create webhook endpoint:
   - URL: `https://admin.nextwave.au/api/stripe/webhook`
   - events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
3. In Vercel production env for admin, set:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
   - `STRIPE_MEDIVAULT_MONTHLY_PRICE_ID=price_...`
   - `NEXT_PUBLIC_ADMIN_URL=https://admin.nextwave.au`
   - Supabase production vars
4. Ensure target clinics have clean `client`-mode billing profiles.
5. Deploy admin dashboard.
6. Run one monitored live subscription checkout for a real clinic.
7. Confirm webhook delivery and verify `GET /api/subscription-status?clientId=<clinic_uuid>` returns the expected state.

## 8) Current Status

- Local Medivault admin checkout works end to end.
- Local webhook delivery works end to end with HTTP 200 for all tested events.
- This billing path is ready for production env cutover and a final live verification pass.
