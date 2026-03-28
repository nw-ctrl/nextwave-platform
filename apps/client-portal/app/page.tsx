import { headers } from "next/headers";
import Link from "next/link";
import { ClinicSelectorCard } from "../components/clinic-selector-card";
import { PortalLoginForm } from "../components/portal-login-form";
import { getPortalSession } from "../lib/auth";
import { isAdmin } from "../lib/role-helper";
import { getReadablePortalPlanName } from "../lib/portal-billing";

export const dynamic = "force-dynamic";

const headingFont = 'Avenir Next, Segoe UI Variable, Segoe UI, sans-serif';
const bodyFont = 'Aptos, Avenir Next, Segoe UI, sans-serif';
const allModules = ["billing"];
const adminOnlyModules = new Set(["billing"]);

const moduleMeta: Record<string, { label: string; description: string; href: string; eyebrow: string }> = {
  billing: {
    label: "Subscription",
    description: "Review plan status, invoices, and billing settings for the current clinic account.",
    href: "/billing",
    eyebrow: "Account"
  }
};

function humanizeRole(role?: string | null) {
  if (!role) return "Doctor";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default async function ClinicPortalHome({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const requestHeaders = await headers();
  const tenantSlug = requestHeaders.get("x-tenant-slug");
  await searchParams;
  const session = await getPortalSession();

  if (!session) {
    return (
      <main className="portal-auth-shell">
        <PortalLoginForm />
        <style>{`.portal-auth-shell{min-height:100vh;display:grid;place-items:center;padding:24px;background:linear-gradient(180deg,#f6f8fb 0%,#eef2f6 100%);}`}</style>
      </main>
    );
  }

  if (session.memberships.length === 0) {
    return (
      <main style={{ padding: 24, fontFamily: bodyFont }}>
        <h1>Clinic Portal</h1>
        <p>Your account is signed in, but it is not attached to a clinic account yet.</p>
      </main>
    );
  }

  const currentMembership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const adminVisible = isAdmin(session.user) || currentMembership.role === "manager";
  const modules = currentMembership.modules.length > 0 ? allModules.filter((item) => currentMembership.modules.includes(item)) : allModules;
  const visibleModules = modules.filter((item) => adminVisible || !adminOnlyModules.has(item));
  const roleLabel = humanizeRole(session.user.role || "doctor");
  const planLabel = getReadablePortalPlanName(currentMembership.subscription?.plan);
  const statusLabel = currentMembership.subscription?.status ?? "inactive";

  return (
    <main className="portal-home">
      <section className="hero-shell">
        <div className="surface-card hero-card">
          <div className="hero-kicker-row">
            <span className="hero-kicker">MediVault Clinical Workspace</span>
            <span className="hero-status">Secure access</span>
          </div>
          <h1>{currentMembership.clinicName}</h1>
          <p className="hero-summary">
            A controlled clinic workspace with clear account context, readable presentation, and a more professional tone for day-to-day use.
          </p>
          <div className="hero-badges">
            <span>{roleLabel}</span>
            <span>{planLabel}</span>
            <span>{statusLabel}</span>
            {tenantSlug ? <span>{tenantSlug}</span> : null}
          </div>
          <div className="hero-meta-grid">
            <div>
              <strong>Signed in as</strong>
              <span>{session.user.fullName ?? session.user.email}</span>
            </div>
            <div>
              <strong>Workspace mode</strong>
              <span>{adminVisible ? "Administrative access" : "Standard clinic access"}</span>
            </div>
            <div>
              <strong>Memberships</strong>
              <span>{session.memberships.length} clinic context{session.memberships.length > 1 ? "s" : ""}</span>
            </div>
            <div>
              <strong>Subscription</strong>
              <span>{planLabel}</span>
            </div>
          </div>
        </div>

        <aside className="surface-card trust-card">
          <div className="trust-header">
            <span className="trust-label">Workspace standards</span>
            <h2>Calm, readable, and client-safe</h2>
          </div>
          <ul className="trust-list">
            <li>Only working account areas are surfaced to avoid dead-end navigation.</li>
            <li>Readable contrast and restrained color use improve clarity across desktop and mobile browsers.</li>
            <li>Subscription language is presented in client-friendly terms rather than internal system labels.</li>
          </ul>
          <div className="trust-note">
            {visibleModules.length
              ? "Open the available account area below to continue."
              : "This account is signed in successfully. Additional account areas will appear only when they are enabled for this clinic."}
          </div>
        </aside>
      </section>

      <section className="selector-wrap">
        <ClinicSelectorCard memberships={session.memberships} selectedClientId={session.selectedClientId} />
      </section>

      <section className="snapshot-grid">
        <article className="surface-card metric-card">
          <span className="metric-label">Account role</span>
          <strong>{roleLabel}</strong>
          <p>Role handling remains unchanged and defaults safely when no explicit web role is present.</p>
        </article>
        <article className="surface-card metric-card">
          <span className="metric-label">Subscription</span>
          <strong>{planLabel}</strong>
          <p>Status: {statusLabel}.</p>
        </article>
        <article className="surface-card metric-card">
          <span className="metric-label">Available area</span>
          <strong>{visibleModules.length}</strong>
          <p>Only active and usable account destinations are shown in this workspace.</p>
        </article>
      </section>

      <section className="workspace-grid">
        <div className="workspace-head">
          <div>
            <span className="section-label">Workspace</span>
            <h2>Available area</h2>
          </div>
          <p>The portal now surfaces only the account path that is currently functional for clients.</p>
        </div>
        {visibleModules.length ? (
          <div className="module-grid">
            {visibleModules.map((item) => {
              const meta = moduleMeta[item];
              return (
                <Link key={item} href={meta.href} className="surface-card module-card">
                  <div className="module-top">
                    <span>{meta.eyebrow}</span>
                    <span className="module-arrow">Open</span>
                  </div>
                  <h3>{meta.label}</h3>
                  <p>{meta.description}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <article className="surface-card empty-card">
            <h3>No additional account areas are enabled for this sign-in</h3>
            <p>If access changes for this clinic, the available area will appear here automatically.</p>
          </article>
        )}
      </section>

      <style>{`
        .portal-home{min-height:100vh;padding:28px 20px 40px;font-family:${bodyFont};color:#0f172a;background:linear-gradient(180deg,#f7f9fb 0%,#eef2f6 100%)}
        .hero-shell,.snapshot-grid,.workspace-grid,.selector-wrap{width:min(1180px,100%);margin:0 auto}
        .hero-shell{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(280px,.95fr);gap:20px;align-items:stretch}
        .surface-card{border:1px solid #dbe3ea;background:#ffffff;box-shadow:0 10px 24px rgba(15,23,42,.06)}
        .hero-card,.trust-card,.metric-card,.module-card,.empty-card{border-radius:26px}
        .hero-card{padding:28px;display:grid;gap:18px}
        .hero-kicker-row,.module-top,.workspace-head{display:flex;justify-content:space-between;gap:12px;align-items:center}
        .hero-kicker,.section-label,.trust-label,.metric-label,.module-top span:first-child{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#64748b}
        .hero-status{padding:7px 12px;border-radius:999px;background:#ecfeff;border:1px solid #bae6fd;font-size:12px;color:#0f766e}
        .hero-card h1,.trust-card h2,.workspace-head h2,.module-card h3,.metric-card strong,.empty-card h3{font-family:${headingFont}}
        .hero-card h1{margin:0;font-size:clamp(2rem,4vw,3.05rem);line-height:1;color:#0f172a}
        .hero-summary{max-width:58ch;margin:0;font-size:15px;line-height:1.7;color:#475569}
        .hero-badges{display:flex;flex-wrap:wrap;gap:10px}.hero-badges span{padding:10px 14px;border-radius:999px;background:#f8fafc;border:1px solid #e2e8f0;color:#334155;font-size:13px}
        .hero-meta-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.hero-meta-grid div{padding:16px 18px;border-radius:18px;background:#f8fafc;border:1px solid #e2e8f0;display:grid;gap:6px}.hero-meta-grid strong{font-size:12px;color:#64748b;letter-spacing:.08em;text-transform:uppercase}.hero-meta-grid span{color:#0f172a;font-size:14px}
        .trust-card{padding:24px;display:flex;flex-direction:column;gap:16px}.trust-card h2{margin:6px 0 0;font-size:1.5rem;color:#0f172a}.trust-list{margin:0;padding-left:18px;display:grid;gap:10px;color:#475569;line-height:1.6}.trust-note{margin-top:auto;padding:16px 18px;border-radius:18px;background:#f8fafc;color:#334155;border:1px solid #e2e8f0}
        .selector-wrap{margin-top:20px}
        .snapshot-grid{margin-top:20px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
        .metric-card{padding:22px;display:grid;gap:12px}.metric-card strong{font-size:1.9rem;color:#0f172a}.metric-card p{margin:0;color:#475569;line-height:1.6;font-size:14px}
        .workspace-grid{margin-top:22px;display:grid;gap:18px}.workspace-head{align-items:end}.workspace-head h2{margin:6px 0 0;font-size:1.9rem;color:#0f172a}.workspace-head p{max-width:52ch;margin:0;color:#64748b;line-height:1.6}
        .module-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
        .module-card{padding:22px;display:grid;gap:14px;text-decoration:none;transition:transform 180ms ease,border-color 180ms ease,box-shadow 180ms ease}.module-card:hover,.module-card:focus-visible{transform:translateY(-2px);border-color:#bfdbfe;box-shadow:0 18px 34px rgba(15,23,42,.10);outline:none}
        .module-arrow{color:#0f766e;font-size:12px;letter-spacing:.12em;text-transform:uppercase}.module-card h3{margin:0;font-size:1.3rem;color:#0f172a}.module-card p{margin:0;color:#475569;line-height:1.65;font-size:14px}
        .empty-card{padding:24px;display:grid;gap:8px}.empty-card h3{margin:0;font-size:1.25rem;color:#0f172a}.empty-card p{margin:0;color:#475569;line-height:1.6}
        @media (max-width:1080px){.hero-shell{grid-template-columns:1fr}.snapshot-grid{grid-template-columns:1fr 1fr}}
        @media (max-width:720px){.portal-home{padding:18px 14px 32px}.hero-meta-grid,.snapshot-grid{grid-template-columns:1fr}.workspace-head,.hero-kicker-row,.module-top{flex-direction:column;align-items:flex-start}}
      `}</style>
    </main>
  );
}
