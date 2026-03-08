import { getClientPortalAccess } from "../lib/access";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const allModules = ["dashboard", "doctors", "templates", "billing", "usage", "settings"];

export default async function ClinicPortalHome({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestHeaders = await headers();
  const resolvedSearchParams = (await searchParams) ?? {};
  const tenantSlug = requestHeaders.get("x-tenant-slug");
  const userId = typeof resolvedSearchParams.userId === "string" ? resolvedSearchParams.userId : null;
  const clientId = typeof resolvedSearchParams.clientId === "string" ? resolvedSearchParams.clientId : null;

  const access = await getClientPortalAccess({ userId, clientId });
  const modules = access.isPlatformAdmin
    ? allModules
    : access.modules.length > 0
      ? allModules.filter((item) => access.modules.includes(item))
      : [];

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Clinic Portal</h1>
      <p>
        User: {userId ?? "missing"} | Client: {clientId ?? "missing"} | Role: {access.role ?? "none"}
      </p>
      <p>Tenant slug: {tenantSlug ?? "none (non-wildcard host)"}</p>
      {modules.length === 0 ? (
        <p>No module access. Check membership scope.modules for this user/client.</p>
      ) : (
        <ul>
          {modules.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
