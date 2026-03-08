# Integrations

## GitHub API
Use installation or PAT token in `GITHUB_TOKEN` for repository sync.
- Multi-repo admin endpoints:
  - `GET/POST /api/github/connections`
  - `GET/POST /api/github/repositories`
  - `POST /api/github/sync`

## Stripe
- Billing logic references `STRIPE_SECRET_KEY`.
- Webhook endpoint: `/api/stripe/webhook`
- Subscription status endpoint: `/api/subscription-status`
- Tenant billing profile endpoint: `GET/POST /api/billing/profiles`
- Subscription checks support both `customerId` and `clientId` query parameters.
- Billing profile secret references:
  - `key_ref`: Stripe secret key reference (`env:STRIPE_SECRET_KEY_CLIENT_A` or `secret:client-a-stripe-key`)
  - `webhook_secret_ref`: Stripe webhook secret reference (`env:STRIPE_WEBHOOK_SECRET_CLIENT_A` or `secret:client-a-whsec`)

## Database Router
- Tenant connection endpoints:
  - `GET/POST /api/databases/connections`
  - `POST /api/databases/test`
- Supported adapters:
  - `supabase`, `postgres`, `firebase`, `mongodb`, `redis`

## Tenant White-label Bootstrap
- Branding endpoints:
  - `GET/POST /api/clients/branding`
- Feature flag endpoints:
  - `GET/POST /api/clients/features`
- App bootstrap endpoint:
  - `GET /api/tenant/bootstrap?clientId=...&appId=...`
