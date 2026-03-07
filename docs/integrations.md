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
