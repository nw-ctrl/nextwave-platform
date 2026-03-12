import { headers } from "next/headers";
import Link from "next/link";
import { ClinicSelectorCard } from "../components/clinic-selector-card";
import { PortalLoginForm } from "../components/portal-login-form";
import { getPortalSession } from "../lib/auth";

export const dynamic = "force-dynamic";

const allModules = ["dashboard", "doctors", "templates", "billing", "usage", "settings"];

export default async function ClinicPortalHome({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestHeaders = await headers();
  const tenantSlug = requestHeaders.get("x-tenant-slug");
  await searchParams;
  const session = await getPortalSession();

  if (!session) {
    return (
      <main
        style={{
          padding: 24,
          fontFamily: "ui-sans-serif, system-ui",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #f8fafc 0%, #eef6f5 100%)"
        }}
      >
        <PortalLoginForm />
      </main>
    );
  }

  if (session.memberships.length === 0) {
    return (
      <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h1>Clinic Portal</h1>
        <p>Your account is signed in, but it is not attached to any clinic memberships yet.</p>
      </main>
    );
  }

  const currentMembership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const modules =
    currentMembership.modules.length > 0 ? allModules.filter((item) => currentMembership.modules.includes(item)) : allModules;

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "ui-sans-serif, system-ui",
        display: "grid",
        gap: 24,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef6f5 100%)"
      }}
    >
      <section style={{ display: "grid", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>Clinic Portal</p>
        <h1 style={{ margin: 0 }}>{currentMembership.clinicName}</h1>
        <p style={{ margin: 0, color: "#4b5563" }}>
          Signed in as {session.user.fullName ?? session.user.email} ({currentMembership.role}). Tenant slug: {tenantSlug ?? "none"}
        </p>
      </section>
      <ClinicSelectorCard memberships={session.memberships} selectedClientId={session.selectedClientId} />
      <section style={{ padding: 24, border: "1px solid #d0d7de", borderRadius: 18, background: "#ffffff" }}>
        <h2 style={{ marginTop: 0 }}>Available modules</h2>
        {modules.length === 0 ? (
          <p>No module access is enabled on this membership.</p>
        ) : (
          <ul style={{ lineHeight: 1.8 }}>
            {modules.map((item) => (
              <li key={item}>{item === "billing" ? <Link href="/billing">billing</Link> : item}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
