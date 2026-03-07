# NextWave Platform

Scalable SaaS monorepo for MediVault.

## Apps
- `apps/website`
- `apps/admin-dashboard`
- `apps/client-portal`

## Packages
- `@nextwave/ui`
- `@nextwave/auth`
- `@nextwave/database`
- `@nextwave/config`
- `@nextwave/analytics`

## Quick start
```bash
corepack pnpm install
corepack pnpm dev
```

## Supabase Keepalive (GitHub Actions)
- Workflow file: `.github/workflows/supabase-keepalive.yml`
- Script: `scripts/supabase-keepalive.mjs`
- Required GitHub secret:
  - `SUPABASE_TARGETS_JSON`
- Example secret value:
```json
[
  {
    "name": "nextwave-core",
    "url": "https://eigjgbpkaosmurjvaphg.supabase.co",
    "anonKey": "YOUR_ANON_KEY",
    "keepaliveTable": "users"
  }
]
```
- Add additional Supabase projects by appending objects in the same JSON array.
