import Link from "next/link";
import { PortalLoginForm } from "../../../components/portal-login-form";
import { getPortalSession } from "../../../lib/auth";
import { isAdmin } from "../../../lib/role-helper";

export const dynamic = "force-dynamic";

const headingFont = 'Avenir Next, Segoe UI Variable, Segoe UI, sans-serif';
const bodyFont = 'Aptos, Avenir Next, Segoe UI, sans-serif';
const pageTitle = "Settings";
const pageIntro = "This admin surface is now aligned with the updated portal UI while preserving the current access model.";
const pageBody = "Use this area for system-level configuration, clinic policies, and future portal preferences.";

export default async function Page() {
  const session = await getPortalSession();

  if (!session) {
    return <main style={{ padding: 24, minHeight: "100vh", display: "grid", placeItems: "center" }}><PortalLoginForm /></main>;
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const adminVisible = isAdmin(session.user) || membership?.role === "manager";

  if (!membership || !adminVisible) {
    return (
      <main className="page-shell">
        <section className="card"><span className="eyebrow">Admin area</span><h1>{pageTitle}</h1><p>Your account does not currently have permission to access this admin area.</p><Link href="/" className="action-link">Back to workspace</Link></section>
        <style>{styles}</style>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="card hero-card"><span className="eyebrow">Admin controls</span><h1>{pageTitle}</h1><p>{pageIntro}</p></section>
      <section className="grid">
        <article className="card"><span className="eyebrow">Status</span><h2>Admin-only workspace</h2><p>{pageBody}</p></article>
        <article className="card"><span className="eyebrow">Navigation</span><div className="actions"><Link href="/">Portal home</Link><Link href="/settings">Settings</Link><Link href="/billing">Subscription</Link></div></article>
      </section>
      <style>{styles}</style>
    </main>
  );
}

const styles = `
  .page-shell{min-height:100vh;padding:28px 20px 40px;font-family:${bodyFont};color:#dcebf6;background:linear-gradient(180deg,#081421 0%,#0c1c2d 55%,#10253b 100%)}
  .hero-card,.grid,.card{width:min(1080px,100%);margin:0 auto}.grid{margin-top:18px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  .card{border-radius:28px;padding:24px;border:1px solid rgba(134,168,197,.18);background:linear-gradient(180deg,rgba(14,28,43,.92) 0%,rgba(12,24,38,.96) 100%);box-shadow:0 24px 60px rgba(3,10,18,.35)}
  .eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8ab0c8}h1,h2{margin:8px 0 10px;font-family:${headingFont};color:#f2fbff}h1{font-size:clamp(2rem,4vw,3rem)}p{margin:0;color:#a8bfce;line-height:1.7}
  .actions{margin-top:12px;display:grid;gap:10px}.actions a,.action-link{display:inline-flex;width:fit-content;margin-top:14px;padding:12px 14px;border-radius:14px;text-decoration:none;color:#eff8ff;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
  @media (max-width:760px){.page-shell{padding:18px 14px 28px}.grid{grid-template-columns:1fr}}
`;
