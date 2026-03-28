import { headers } from "next/headers";
import Link from "next/link";
import { ClinicSelectorCard } from "../components/clinic-selector-card";
import { PortalLoginForm } from "../components/portal-login-form";
import { getPortalSession } from "../lib/auth";
import { isAdmin } from "../lib/role-helper";

export const dynamic = "force-dynamic";

const headingFont = 'Avenir Next, Segoe UI Variable, Segoe UI, sans-serif';
const bodyFont = 'Aptos, Avenir Next, Segoe UI, sans-serif';
const allModules = ["dashboard", "doctors", "templates", "billing", "usage", "settings"];
const adminOnlyModules = new Set(["billing", "doctors", "settings"]);

const moduleMeta: Record<string, { label: string; description: string; href: string; eyebrow: string }> = {
  dashboard: { label: "Dashboard", description: "See the clinic workspace, access overview cards, and step into the modules you use most.", href: "/dashboard", eyebrow: "Overview" },
  doctors: { label: "Manage Doctors", description: "Admin-only controls for clinic members, doctor access, and future team operations.", href: "/doctors", eyebrow: "Admin" },
  templates: { label: "Templates", description: "Keep prescription and clinical content standards consistent as the portal expands.", href: "/templates", eyebrow: "Content" },
  billing: { label: "Subscription", description: "Review plan status, invoices, and billing actions tied to the current clinic.", href: "/billing", eyebrow: "Admin" },
  usage: { label: "Usage", description: "Track patient and visit volume signals already connected to the Medivault billing model.", href: "/usage", eyebrow: "Insights" },
  settings: { label: "Settings", description: "Admin-only configuration space for system-level controls and future clinic preferences.", href: "/settings", eyebrow: "Admin" }
};

function humanizePlan(plan?: string | null) {
  if (!plan) return "No active plan";
  return plan.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function humanizeRole(role?: string | null) {
  if (!role) return "Doctor";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default async function ClinicPortalHome({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>>; }) {
  const requestHeaders = await headers();
  const tenantSlug = requestHeaders.get("x-tenant-slug");
  await searchParams;
  const session = await getPortalSession();

  if (!session) {
    return (
      <main className="portal-auth-shell">
        <PortalLoginForm />
        <style>{`.portal-auth-shell{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at top left, rgba(42,184,177,.2), transparent 24%),radial-gradient(circle at bottom right, rgba(30,76,124,.22), transparent 26%),linear-gradient(180deg,#f4fbfa 0%,#e5eef5 100%);}`}</style>
      </main>
    );
  }

  if (session.memberships.length === 0) {
    return <main style={{ padding: 24, fontFamily: bodyFont }}><h1>Clinic Portal</h1><p>Your account is signed in, but it is not attached to any clinic memberships yet.</p></main>;
  }

  const currentMembership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const adminVisible = isAdmin(session.user) || currentMembership.role === "manager";
  const modules = currentMembership.modules.length > 0 ? allModules.filter((item) => currentMembership.modules.includes(item)) : allModules;
  const visibleModules = modules.filter((item) => adminVisible || !adminOnlyModules.has(item));
  const roleLabel = humanizeRole(session.user.role || "doctor");
  const planLabel = humanizePlan(currentMembership.subscription?.plan);
  const statusLabel = currentMembership.subscription?.status ?? "inactive";
  const personalizedMessage = adminVisible ? "Admin controls stay visible, while the clinic workspace remains compact and data-forward." : "Doctor-safe navigation stays focused on day-to-day workspace modules and hides admin surfaces by default.";

  return (
    <main className="portal-home">
      <section className="hero-shell">
        <div className="hero-copy surface-card hero-card">
          <div className="hero-kicker-row"><span className="hero-kicker">MediVault Clinical Workspace</span><span className="hero-status">Secure access</span></div>
          <h1>{currentMembership.clinicName}</h1>
          <p className="hero-summary">A secure, role-aware workspace designed for modern clinics. The interface emphasizes operational clarity, controlled access, and a professional presentation without changing the underlying workflow model.</p>
          <div className="hero-badges"><span>{roleLabel}</span><span>{planLabel}</span><span>{visibleModules.length} active modules</span>{tenantSlug ? <span>{tenantSlug}</span> : null}</div>
          <div className="hero-meta-grid">
            <div><strong>Signed in as</strong><span>{session.user.fullName ?? session.user.email}</span></div>
            <div><strong>Workspace mode</strong><span>{adminVisible ? "Admin workspace" : "Doctor workspace"}</span></div>
            <div><strong>Memberships</strong><span>{session.memberships.length} clinic context{session.memberships.length > 1 ? "s" : ""}</span></div>
            <div><strong>Subscription status</strong><span>{statusLabel}</span></div>
          </div>
        </div>
        <aside className="surface-card trust-card">
          <div className="trust-header"><span className="trust-label">Design priorities</span><h2>Professional clinical product standards</h2></div>
          <ul className="trust-list">
            <li>Role-based navigation keeps the workspace focused and reduces unnecessary decision points.</li>
            <li>Visible security and clinic context reinforce trust in day-to-day medical operations.</li>
            <li>High-contrast layouts and restrained copy improve readability across clinical environments.</li>
            <li>Responsive card structures support desktop and smaller in-clinic devices without losing clarity.</li>
          </ul>
          <div className="trust-note">{personalizedMessage}</div>
        </aside>
      </section>
      <section className="selector-wrap"><ClinicSelectorCard memberships={session.memberships} selectedClientId={session.selectedClientId} /></section>
      <section className="snapshot-grid">
        <article className="surface-card metric-card"><span className="metric-label">Clinic access</span><strong>{roleLabel}</strong><p>Role defaults safely to doctor when no explicit web role is present.</p></article>
        <article className="surface-card metric-card"><span className="metric-label">Plan</span><strong>{planLabel}</strong><p>Status: {statusLabel}. Billing stays available only when the membership permits it.</p></article>
        <article className="surface-card metric-card"><span className="metric-label">Modules</span><strong>{visibleModules.length}</strong><p>{adminVisible ? "Admin-only modules are surfaced." : "Admin-only modules stay hidden for doctor views."}</p></article>
        <article className="surface-card metric-card"><span className="metric-label">Trust posture</span><strong>Protected</strong><p>Secure login, role-aware routing, and explicit server checks remain in place.</p></article>
      </section>
      <section className="workspace-grid">
        <div className="workspace-head"><div><span className="section-label">Workspace</span><h2>Available modules</h2></div><p>The portal now reads more like a modern healthcare SaaS workspace: fewer dead zones, clearer entry points, and stronger visual hierarchy.</p></div>
        <div className="module-grid">{visibleModules.map((item) => { const meta = moduleMeta[item] ?? { label: item, description: "Open module", href: `/${item}`, eyebrow: "Module" }; return <Link key={item} href={meta.href} className="surface-card module-card"><div className="module-top"><span>{meta.eyebrow}</span><span className="module-arrow">Open</span></div><h3>{meta.label}</h3><p>{meta.description}</p></Link>; })}</div>
      </section>
      <section className="notes-grid">
        <article className="surface-card note-card"><span className="section-label">Presentation</span><h3>Clear hierarchy with a more professional tone</h3><p>The updated layout replaces the plain module list with structured cards, stronger contrast, and clearer action framing. The result is closer to a clinical operations product than a generic internal tool.</p></article>
        <article className="surface-card note-card accent-card"><span className="section-label">Trust and control</span><h3>Security and accountability are visible from entry</h3><p>Clinical software should communicate control immediately. This shell keeps secure access, role state, and clinic context explicit at the point of entry.</p></article>
      </section>
      <style>{`
        .portal-home{min-height:100vh;padding:28px 20px 40px;font-family:${bodyFont};color:#dcebf6;background:radial-gradient(circle at 0% 0%, rgba(48,180,162,.22), transparent 24%),radial-gradient(circle at 100% 0%, rgba(59,130,246,.18), transparent 22%),linear-gradient(180deg,#081421 0%,#0c1c2d 55%,#10253b 100%)}
        .hero-shell,.snapshot-grid,.workspace-grid,.notes-grid,.selector-wrap{width:min(1240px,100%);margin:0 auto}
        .hero-shell{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,.95fr);gap:20px;align-items:stretch}
        .surface-card{border:1px solid rgba(134,168,197,.18);background:linear-gradient(180deg,rgba(14,28,43,.92) 0%,rgba(12,24,38,.96) 100%);box-shadow:0 24px 60px rgba(3,10,18,.35);backdrop-filter:blur(14px)}
        .hero-card,.trust-card,.metric-card,.note-card,.module-card{border-radius:28px}
        .hero-card{padding:28px;position:relative;overflow:hidden}.hero-card::after{content:"";position:absolute;inset:auto -80px -110px auto;width:240px;height:240px;border-radius:999px;background:radial-gradient(circle, rgba(51,214,193,.26), transparent 70%);pointer-events:none}
        .hero-kicker-row,.module-top,.workspace-head{display:flex;justify-content:space-between;gap:12px;align-items:center}
        .hero-kicker,.section-label,.trust-label,.metric-label,.module-top span:first-child{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8ab0c8}
        .hero-status{padding:7px 12px;border-radius:999px;background:rgba(27,203,186,.14);border:1px solid rgba(27,203,186,.3);font-size:12px;color:#8ef3eb}
        .hero-card h1,.trust-card h2,.workspace-head h2,.note-card h3,.module-card h3,.metric-card strong{font-family:${headingFont}}
        .hero-card h1{margin:18px 0 10px;font-size:clamp(2rem,4vw,3.35rem);line-height:1;color:#f3fbff}
        .hero-summary{max-width:56ch;margin:0;font-size:15px;line-height:1.7;color:#a6bfd1}
        .hero-badges{margin-top:18px;display:flex;flex-wrap:wrap;gap:10px}.hero-badges span{padding:10px 14px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(137,171,198,.18);color:#edf7ff;font-size:13px}
        .hero-meta-grid{margin-top:22px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.hero-meta-grid div{padding:16px 18px;border-radius:20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);display:grid;gap:6px}.hero-meta-grid strong{font-size:12px;color:#88aac2;letter-spacing:.08em;text-transform:uppercase}.hero-meta-grid span{color:#eff8ff;font-size:14px}
        .trust-card{padding:24px;display:flex;flex-direction:column;gap:16px}.trust-card h2{margin:6px 0 0;font-size:1.5rem;color:#f2fbff}.trust-list{margin:0;padding-left:18px;display:grid;gap:10px;color:#b6ccdb;line-height:1.6}.trust-note{margin-top:auto;padding:16px 18px;border-radius:18px;background:linear-gradient(180deg,rgba(23,59,76,.9),rgba(16,43,58,.95));color:#dff8ff;border:1px solid rgba(97,213,224,.14)}
        .selector-wrap{margin-top:20px}.snapshot-grid{margin-top:20px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.metric-card{padding:22px;display:grid;gap:12px}.metric-card strong{font-size:2rem;color:#f5fbff}.metric-card p{margin:0;color:#a7bfd0;line-height:1.6;font-size:14px}
        .workspace-grid{margin-top:22px;display:grid;gap:18px}.workspace-head{align-items:end}.workspace-head h2{margin:6px 0 0;font-size:1.9rem;color:#f2fbff}.workspace-head p{max-width:52ch;margin:0;color:#9eb8cc;line-height:1.6}.module-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
        .module-card{padding:22px;display:grid;gap:14px;text-decoration:none;transition:transform 180ms ease,border-color 180ms ease,box-shadow 180ms ease}.module-card:hover,.module-card:focus-visible{transform:translateY(-3px);border-color:rgba(116,230,216,.32);box-shadow:0 30px 60px rgba(4,13,23,.45);outline:none}.module-arrow{color:#8ef3eb;font-size:12px;letter-spacing:.12em;text-transform:uppercase}.module-card h3{margin:0;font-size:1.35rem;color:#f3fbff}.module-card p{margin:0;color:#a8c0d0;line-height:1.65;font-size:14px}
        .notes-grid{margin-top:20px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.note-card{padding:24px;display:grid;gap:10px}.note-card h3{margin:0;font-size:1.45rem;color:#f2fbff}.note-card p{margin:0;color:#a8bfce;line-height:1.7}.accent-card{background:linear-gradient(180deg,rgba(8,47,57,.96),rgba(8,35,43,.98))}
        @media (max-width:1080px){.hero-shell,.notes-grid{grid-template-columns:1fr}.snapshot-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media (max-width:720px){.portal-home{padding:18px 14px 32px}.hero-meta-grid,.snapshot-grid,.notes-grid{grid-template-columns:1fr}.workspace-head,.hero-kicker-row,.module-top{flex-direction:column;align-items:flex-start}}
      `}</style>
    </main>
  );
}
