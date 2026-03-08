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

## Access Control
- Platform roles:
  - `GET/POST /api/access/platform-roles`
  - roles: `superuser`, `admin`, `auditor`
- Tenant memberships:
  - `GET/POST /api/access/memberships`
  - roles: `admin`, `manager`, `staff`, `viewer`
- Effective access view:
  - `GET /api/access/effective?userId=...`
- Authorization context for privileged writes:
  - `x-actor-user-id: <user_uuid>` header
  - or `?actorUserId=<user_uuid>` query param

## Superuser Operations
- Account actions (requires superuser):
  - `POST /api/admin/accounts`
  - actions: `block`, `unblock`, `delete`, `reset_password`
- Subscription override (requires superuser):
  - `POST /api/admin/subscriptions/override`
