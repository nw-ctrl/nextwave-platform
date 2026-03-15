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
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #eef6f5 100%)" }}>
      {/* BRANDING BANNER */}
      <header style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "16px 24px", 
        background: "#0f766e", 
        color: "white",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        fontFamily: "ui-sans-serif, system-ui"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ 
            width: 36, 
            height: 36, 
            background: "white", 
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0f766e"
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, letterSpacing: "-0.01em" }}>MediVault</h1>
            <p style={{ margin: 0, fontSize: "11px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Powered by NextWave</p>
          </div>
        </div>
        
        {/* Dynamic Clinic Name */}
        <div style={{ 
          background: "rgba(255, 255, 255, 0.15)", 
          padding: "6px 16px", 
          borderRadius: "999px",
          fontSize: "14px",
          fontWeight: 600,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ width: "8px", height: "8px", background: "#34d399", borderRadius: "50%", display: "inline-block" }}></span>
          {currentMembership.clinicName}
        </div>
      </header>

      <main
        style={{
          padding: 24,
          fontFamily: "ui-sans-serif, system-ui",
          display: "grid",
          gap: 24
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
    </div>
  );
}
