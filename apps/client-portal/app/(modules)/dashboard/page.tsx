import Link from "next/link";
import { PortalLoginForm } from "../../../components/portal-login-form";
import { getPortalSession } from "../../../lib/auth";

export const dynamic = "force-dynamic";

const headingFont = 'Avenir Next, Segoe UI Variable, Segoe UI, sans-serif';
const bodyFont = 'Aptos, Avenir Next, Segoe UI, sans-serif';

export default async function Page() {
  const session = await getPortalSession();

  if (!session) {
    return <main style={{ padding: 24, minHeight: "100vh", display: "grid", placeItems: "center" }}><PortalLoginForm /></main>;
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];

  return (
    <main className="dashboard-page">
      <section className="card hero-card"><span className="eyebrow">Clinic overview</span><h1>{membership.clinicName}</h1><p>The dashboard shell is now structured like a modern health SaaS workspace: fast scanning, strong contrast, and clear paths into billing, templates, and usage insights.</p></section>
      <section className="grid">
        <article className="card stat-card"><span className="eyebrow">Role</span><strong>{membership.role}</strong><p>Access is still controlled by the existing membership model.</p></article>
        <article className="card stat-card"><span className="eyebrow">Plan</span><strong>{membership.subscription?.plan ?? "inactive"}</strong><p>Subscription data remains sourced from the current portal session.</p></article>
      </section>
      <section className="grid links-grid">
        <Link href="/billing" className="card link-card"><span className="eyebrow">Subscription</span><h2>Billing workspace</h2><p>Review invoices, plan state, and billing actions.</p></Link>
        <Link href="/templates" className="card link-card"><span className="eyebrow">Content</span><h2>Templates</h2><p>Prepare prescription and clinic content systems.</p></Link>
        <Link href="/usage" className="card link-card"><span className="eyebrow">Insights</span><h2>Usage</h2><p>Track patient and visit volume indicators tied to the portal.</p></Link>
      </section>
      <style>{`
        .dashboard-page{min-height:100vh;padding:28px 20px 40px;font-family:${bodyFont};color:#dcebf6;background:linear-gradient(180deg,#081421 0%,#0c1c2d 55%,#10253b 100%)}
        .hero-card,.grid{width:min(1080px,100%);margin:0 auto}.card{border-radius:28px;padding:24px;border:1px solid rgba(134,168,197,.18);background:linear-gradient(180deg,rgba(14,28,43,.92) 0%,rgba(12,24,38,.96) 100%);box-shadow:0 24px 60px rgba(3,10,18,.35)}
        .eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8ab0c8}.hero-card h1,.link-card h2,.stat-card strong{font-family:${headingFont};color:#f2fbff}.hero-card h1{margin:8px 0 10px;font-size:clamp(2rem,4vw,3rem)}
        .hero-card p,.stat-card p,.link-card p{margin:0;color:#a8bfce;line-height:1.7}.grid{margin-top:18px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.links-grid{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.stat-card strong{display:block;margin-top:10px;font-size:2rem}.link-card{text-decoration:none}.link-card h2{margin:8px 0}
        @media (max-width:760px){.dashboard-page{padding:18px 14px 28px}.grid{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}
