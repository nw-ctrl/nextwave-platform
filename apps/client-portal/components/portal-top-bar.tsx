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
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        width: "100%",
        borderBottom: "1px solid rgba(204, 220, 223, 0.8)",
        background: "rgba(248, 251, 251, 0.72)",
        backdropFilter: "blur(22px) saturate(150%)",
        boxShadow: "0 14px 36px rgba(29, 46, 58, 0.05)",
        fontFamily: bodyFont
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 15,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #203744 0%, #4f7d79 100%)",
                color: "#ffffff",
                boxShadow: "0 12px 22px rgba(79,125,121,0.14)"
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
              <div style={{ fontSize: 18, fontWeight: 800, color: "#203744", letterSpacing: "-0.02em" }}>MediVault</div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#70868f", fontWeight: 700 }}>Clinic Portal</div>
            </div>
          </div>

          <div style={{ height: 28, width: 1, background: "#dbe6e7" }} />

          <div style={{ display: "grid", gap: 2 }}>
            <div style={{ fontSize: 18, lineHeight: 1.05, fontWeight: 700, color: "#203744", fontFamily: headingFont }}>{clinicName}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: "#70868f" }}>
              <span>{planName}</span>
              <span>|</span>
              <span>{billingStatus}</span>
              <span>|</span>
              <span>Next cycle {nextBillingDate}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {memberships.length > 1 ? (
            <>
              <select
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #d7e2e5",
                  background: "rgba(255,255,255,0.88)",
                  color: "#203744",
                  fontWeight: 600,
                  fontFamily: bodyFont
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
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid #d7e2e5",
                  background: "rgba(255,255,255,0.88)",
                  color: "#203744",
                  fontWeight: 700,
                  cursor: pending ? "wait" : "pointer",
                  fontFamily: bodyFont
                }}
              >
                Use Clinic
              </button>
            </>
          ) : null}

          <a
            href="/api/billing/manage"
            style={{
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 12,
              background: "#203744",
              color: "#ffffff",
              fontWeight: 700,
              boxShadow: "0 10px 18px rgba(32,55,68,0.12)"
            }}
          >
            Manage Billing
          </a>

          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #d7e2e5",
              background: "rgba(255,255,255,0.88)",
              color: "#203744",
              fontWeight: 700,
              cursor: pending ? "wait" : "pointer",
              fontFamily: bodyFont
            }}
          >
            Logout
          </button>
        </div>
      </div>
      {status ? (
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px 10px 20px", color: status.includes("Unable") || status.includes("failed") ? "#b91c1c" : "#70868f", fontSize: 13, fontWeight: 600 }}>
          {status}
        </div>
      ) : null}
    </header>
  );
}
