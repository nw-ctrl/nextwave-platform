"use client";

import { useState } from "react";

type Membership = {
  clientId: string;
  clinicName: string;
  role: string;
};

type Props = {
  memberships: Membership[];
  selectedClientId: string | null;
  clinicName: string;
  planName: string;
  billingStatus: string;
  nextBillingDate: string;
  billingNote?: string | null;
  savingsHighlight?: string | null;
  savingsSubnote?: string | null;
  nextCycleAmount?: string | null;
};

const headingFont = 'Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif';
const bodyFont = 'Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif';

export function PortalTopBar({
  memberships,
  selectedClientId,
  clinicName,
  planName,
  billingStatus,
  nextBillingDate,
  billingNote,
  savingsHighlight,
  savingsSubnote,
  nextCycleAmount
}: Props) {
  const [clientId, setClientId] = useState(selectedClientId ?? memberships[0]?.clientId ?? "");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSelect() {
    if (!clientId || clientId === selectedClientId) {
      return;
    }

    setPending(true);
    setStatus("Switching clinic...");

    try {
      const response = await fetch("/api/auth/select-clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(typeof result?.error === "string" ? result.error : "Unable to switch clinic");
      }

      window.location.reload();
    } catch (error) {
      setPending(false);
      setStatus(error instanceof Error ? error.message : "Clinic selection failed");
    }
  }

  async function handleLogout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="portal-topbar">
      <div className="portal-topbar-inner">
        <div className="portal-topbar-brand">
          <div className="portal-topbar-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <path d="M9 9h6" />
              <path d="M9 13h6" />
              <path d="M9 17h4" />
            </svg>
          </div>
          <div className="portal-topbar-intro">
            <div className="portal-topbar-title">MediVault</div>
            <div className="portal-topbar-role">Clinical Workspace</div>
          </div>
        </div>

        <div className="portal-topbar-main">
          <div className="portal-topbar-clinic">{clinicName}</div>
          <div className="portal-topbar-plan">
            <span>{planName}</span>
            <span>•</span>
            <span>{billingStatus}</span>
          </div>
          <div className="portal-topbar-cycle">
            <span>{nextCycleAmount ?? "Pricing available in your account"}</span>
            <span>•</span>
            <span>{nextBillingDate ? `Renews ${nextBillingDate}` : "Renewal date available in your account"}</span>
          </div>
          {billingNote ? <div className="portal-topbar-pill">{billingNote}</div> : null}
        </div>

        <div className="portal-topbar-actions">
          {memberships.length > 1 ? (
            <>
              <select
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className="portal-topbar-select"
              >
                {memberships.map((item) => (
                  <option key={item.clientId} value={item.clientId}>
                    {item.clinicName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSelect}
                disabled={pending || clientId === selectedClientId}
                className="portal-topbar-button"
              >
                Switch Clinic
              </button>
            </>
          ) : null}
          <a href="/api/billing/manage" className="portal-topbar-link">
            Billing
          </a>
          <button type="button" onClick={handleLogout} disabled={pending} className="portal-topbar-link ghost">
            Logout
          </button>
        </div>
      </div>

      {(savingsHighlight || savingsSubnote) && (
        <div className="portal-topbar-savings">
          <div className="portal-topbar-savings-main">{savingsHighlight ?? "Your current subscription details are active."}</div>
          {savingsSubnote ? <div className="portal-topbar-savings-sub">{savingsSubnote}</div> : null}
        </div>
      )}

      {status ? (
        <div className="portal-topbar-status" role="status">
          {status}
        </div>
      ) : null}

      <style jsx>{`
        .portal-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          width: 100%;
          background: linear-gradient(120deg, rgba(4, 36, 26, 0.95), rgba(7, 21, 48, 0.9));
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 30px rgba(2, 4, 10, 0.6);
          backdrop-filter: blur(18px);
        }

        .portal-topbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          padding: 12px 24px;
          box-sizing: border-box;
          font-family: Aptos, Avenir Next, Segoe UI, sans-serif;
        }

        .portal-topbar-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 0 1 280px;
        }

        .portal-topbar-logo {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: linear-gradient(180deg, #28ebd9 0%, #1db4b4 100%);
          display: grid;
          place-items: center;
          color: #062229;
          box-shadow: 0 18px 36px rgba(33, 205, 216, 0.35);
        }

        .portal-topbar-intro {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .portal-topbar-title {
          font-family: Avenir Next, Segoe UI Variable, Segoe UI, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #f9fbff;
        }

        .portal-topbar-role {
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.68);
        }

        .portal-topbar-main {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1 1 340px;
          min-width: 220px;
        }

        .portal-topbar-clinic {
          font-size: 18px;
          font-weight: 600;
          font-family: Avenir Next, Segoe UI Variable, Segoe UI, sans-serif;
          color: #f2fbff;
        }

        .portal-topbar-plan,
        .portal-topbar-cycle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.68);
        }

        .portal-topbar-cycle span:first-child {
          letter-spacing: 0;
          text-transform: none;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
        }

        .portal-topbar-pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          font-size: 11px;
          letter-spacing: 0.08em;
          color: #9bf1ff;
        }

        .portal-topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .portal-topbar-select,
        .portal-topbar-button,
        .portal-topbar-link {
          font-family: Aptos, Avenir Next, Segoe UI, sans-serif;
          font-size: 13px;
        }

        .portal-topbar-select {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(5, 14, 22, 0.75);
          color: #eff9ff;
          min-width: 160px;
          flex: 1 1 180px;
        }

        .portal-topbar-select:focus {
          outline: 2px solid rgba(34, 214, 220, 0.9);
          outline-offset: 2px;
        }

        .portal-topbar-button {
          padding: 10px 16px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(180deg, #22d6dc 0%, #1ebec6 100%);
          color: #042129;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(29, 213, 217, 0.25);
        }

        .portal-topbar-link {
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #e5f7ff;
          text-decoration: none;
          font-weight: 600;
        }

        .portal-topbar-link.ghost {
          border-color: rgba(255, 255, 255, 0.1);
          background: transparent;
          color: rgba(255, 255, 255, 0.8);
        }

        .portal-topbar-savings {
          max-width: 1280px;
          margin: 0 auto;
          padding: 6px 24px 14px 24px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.82);
        }

        .portal-topbar-savings-main {
          font-weight: 600;
        }

        .portal-topbar-savings-sub {
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
        }

        .portal-topbar-status {
          max-width: 1280px;
          margin: 0 auto 6px auto;
          padding: 0 24px 8px 24px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        @media (max-width: 900px) {
          .portal-topbar-main {
            width: 100%;
          }

          .portal-topbar-select,
          .portal-topbar-button,
          .portal-topbar-link {
            min-height: 44px;
          }

          .portal-topbar-inner {
            flex-direction: column;
            align-items: flex-start;
          }

          .portal-topbar-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }

        @media (max-width: 640px) {
          .portal-topbar-inner {
            padding: 12px 14px;
            gap: 12px;
          }

          .portal-topbar-brand {
            flex: 1 1 auto;
          }

          .portal-topbar-main {
            min-width: 0;
          }

          .portal-topbar-clinic {
            font-size: 16px;
          }

          .portal-topbar-plan,
          .portal-topbar-cycle {
            flex-wrap: wrap;
            gap: 4px;
          }

          .portal-topbar-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .portal-topbar-select,
          .portal-topbar-button,
          .portal-topbar-link {
            width: 100%;
            box-sizing: border-box;
            justify-content: center;
            text-align: center;
          }

          .portal-topbar-savings,
          .portal-topbar-status {
            padding: 6px 14px 12px;
          }

          .portal-topbar-savings,
          .portal-topbar-status {
            padding: 6px 16px;
          }
        }
      `}</style>
    </header>
  );
}
