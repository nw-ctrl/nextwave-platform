import { getClientPortalAccess } from "../lib/access";

const allModules = ["dashboard", "doctors", "templates", "billing", "usage", "settings"];

export default async function ClinicPortalHome({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const userId = typeof searchParams?.userId === "string" ? searchParams.userId : null;
  const clientId = typeof searchParams?.clientId === "string" ? searchParams.clientId : null;

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