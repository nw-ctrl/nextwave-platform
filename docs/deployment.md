# Deployment Targets

- Website: `nextwave.au`
- Admin: `admin.nextwave.au`
- Clinic portals: `clinicname.nextwave.au`

## Vercel setup
1. Import monorepo in Vercel.
2. Create three projects mapping to `apps/website`, `apps/admin-dashboard`, `apps/client-portal`.
3. Configure wildcard domain for clinic portals.
4. Set shared env vars from `.env.example`.