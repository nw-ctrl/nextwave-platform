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
};

const headingFont = 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif';
const bodyFont = 'Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif';

export function PortalTopBar({
  memberships,
  selectedClientId,
  clinicName,
  planName,
  billingStatus,
  nextBillingDate,
  billingNote
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
        borderBottom: "1px solid rgba(255,255,255,0.46)",
        background: "rgba(236, 243, 244, 0.76)",
        backdropFilter: "blur(22px) saturate(145%)",
        boxShadow: "0 14px 34px rgba(70, 92, 99, 0.08)",
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
                background: "linear-gradient(135deg, rgba(115,156,148,0.94) 0%, rgba(156,188,181,0.92) 100%)",
                color: "#f8fbfb",
                boxShadow: "0 12px 22px rgba(96,137,130,0.16)"
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
              <div style={{ fontFamily: headingFont, fontSize: 24, color: "#234048", letterSpacing: "0.04em" }}>MediVault</div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(70, 92, 99, 0.56)", fontWeight: 600 }}>Clinic Portal</div>
            </div>
          </div>

          <div className="portal-topbar-divider" style={{ height: 28, width: 1, background: "rgba(128, 148, 154, 0.18)" }} />

          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 18, lineHeight: 1.05, color: "#234048", fontFamily: headingFont }}>{clinicName}</div>
            <div className="portal-topbar-meta" style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: "rgba(70, 92, 99, 0.68)" }}>
              <span>{planName}</span>
              <span>|</span>
              <span>{billingStatus}</span>
              <span>|</span>
              <span>Next cycle {nextBillingDate}</span>
            </div>
            {billingNote ? (
              <div style={{ display: "inline-flex", width: "fit-content", padding: "6px 10px", borderRadius: 999, background: "rgba(115,156,148,0.12)", border: "1px solid rgba(115,156,148,0.18)", color: "#41615e", fontSize: 12 }}>
                {billingNote}
              </div>
            ) : null}
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
                  border: "1px solid rgba(128, 148, 154, 0.18)",
                  background: "rgba(255,255,255,0.74)",
                  color: "#24414a",
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
                  border: "1px solid rgba(128, 148, 154, 0.18)",
                  background: "rgba(255,255,255,0.74)",
                  color: "#24414a",
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
              background: "linear-gradient(180deg, rgba(124,163,155,0.96) 0%, rgba(96,137,130,0.94) 100%)",
              border: "1px solid rgba(108, 146, 138, 0.3)",
              color: "#f7fbfb",
              fontWeight: 600,
              boxShadow: "0 10px 20px rgba(96,137,130,0.16)"
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
              border: "1px solid rgba(128, 148, 154, 0.18)",
              background: "rgba(255,255,255,0.68)",
              color: "#41615e",
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
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 22px 10px 22px", color: status.includes("Unable") || status.includes("failed") ? "#b91c1c" : "rgba(70, 92, 99, 0.66)", fontSize: 13, fontWeight: 500 }}>
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

          .portal-topbar-select,
          .portal-topbar-primary {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </header>
  );
}