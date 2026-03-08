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

## Wildcard Tenant Routing
1. `apps/client-portal/middleware.ts` injects `x-tenant-slug` from host.
2. Portal pages can resolve tenant identity from header (for example `clinicname.nextwave.au` -> `clinicname`).
