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
};

const headingFont = 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif';
const bodyFont = 'Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif';

export function PortalTopBar({
  memberships,
  selectedClientId,
  clinicName,
  planName,
  billingStatus,
  nextBillingDate
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
    <header
      className="portal-topbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        width: "100%",
        borderBottom: "1px solid rgba(255,255,255,0.35)",
        background: "rgba(246, 241, 233, 0.56)",
        backdropFilter: "blur(24px) saturate(140%)",
        boxShadow: "0 18px 40px rgba(91, 83, 72, 0.06)",
        fontFamily: bodyFont
      }}
    >
      <div
        className="portal-topbar-inner"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap"
        }}
      >
        <div className="portal-topbar-brand-row" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 18,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, rgba(61,83,86,0.9) 0%, rgba(129,163,154,0.72) 100%)",
                color: "#ffffff",
                boxShadow: "0 12px 22px rgba(79,125,121,0.08)"
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M9 9h6" />
                <path d="M9 13h6" />
                <path d="M9 17h4" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: headingFont, fontSize: 24, color: "#37312b", letterSpacing: "0.04em" }}>MediVault</div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(88, 79, 70, 0.52)", fontWeight: 600 }}>Clinic Portal</div>
            </div>
          </div>

          <div className="portal-topbar-divider" style={{ height: 28, width: 1, background: "rgba(120, 110, 100, 0.14)" }} />

          <div style={{ display: "grid", gap: 3 }}>
            <div style={{ fontSize: 18, lineHeight: 1.05, color: "#3e3832", fontFamily: headingFont }}>{clinicName}</div>
            <div className="portal-topbar-meta" style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: "rgba(88, 79, 70, 0.52)" }}>
              <span>{planName}</span>
              <span>|</span>
              <span>{billingStatus}</span>
              <span>|</span>
              <span>Next cycle {nextBillingDate}</span>
            </div>
          </div>
        </div>

        <div className="portal-topbar-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {memberships.length > 1 ? (
            <>
              <select
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className="portal-topbar-control portal-topbar-select"
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(146, 140, 130, 0.16)",
                  background: "rgba(255,255,255,0.44)",
                  color: "#4b443d",
                  fontWeight: 500,
                  fontFamily: bodyFont,
                  backdropFilter: "blur(16px)"
                }}
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
                className="portal-topbar-control"
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(146, 140, 130, 0.16)",
                  background: "rgba(255,255,255,0.44)",
                  color: "#4b443d",
                  fontWeight: 500,
                  cursor: pending ? "wait" : "pointer",
                  fontFamily: bodyFont,
                  backdropFilter: "blur(16px)"
                }}
              >
                Use Clinic
              </button>
            </>
          ) : null}

          <a
            href="/api/billing/manage"
            className="portal-topbar-control portal-topbar-primary"
            style={{
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.6)",
              color: "#3e3832",
              fontWeight: 500,
              boxShadow: "0 10px 18px rgba(120,108,93,0.05)",
              backdropFilter: "blur(16px)"
            }}
          >
            Manage Billing
          </a>

          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className="portal-topbar-control"
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              border: "1px solid rgba(146, 140, 130, 0.16)",
              background: "rgba(255,255,255,0.34)",
              color: "rgba(75, 68, 61, 0.8)",
              fontWeight: 500,
              cursor: pending ? "wait" : "pointer",
              fontFamily: bodyFont,
              backdropFilter: "blur(16px)"
            }}
          >
            Logout
          </button>
        </div>
      </div>
      {status ? (
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 22px 10px 22px", color: status.includes("Unable") || status.includes("failed") ? "#b91c1c" : "rgba(88, 79, 70, 0.58)", fontSize: 13, fontWeight: 500 }}>
          {status}
        </div>
      ) : null}

      <style jsx>{`
        @media (max-width: 920px) {
          .portal-topbar-inner {
            align-items: flex-start !important;
          }

          .portal-topbar-actions {
            width: 100%;
          }
        }

        @media (max-width: 680px) {
          .portal-topbar {
            position: sticky;
          }

          .portal-topbar-inner {
            padding: 12px 14px !important;
            gap: 12px !important;
          }

          .portal-topbar-brand-row {
            width: 100%;
            gap: 12px !important;
          }

          .portal-topbar-divider {
            display: none !important;
          }

          .portal-topbar-meta {
            gap: 6px !important;
          }

          .portal-topbar-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 8px !important;
          }

          .portal-topbar-control {
            width: 100%;
            text-align: center;
            justify-content: center;
          }

          .portal-topbar-select {
            grid-column: 1 / -1;
          }

          .portal-topbar-primary {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </header>
  );
}
