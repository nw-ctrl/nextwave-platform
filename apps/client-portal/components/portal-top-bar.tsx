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
        borderBottom: "1px solid rgba(148,163,184,0.22)",
        background: "rgba(246,250,252,0.82)",
        backdropFilter: "blur(18px) saturate(140%)",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)"
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
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #123047 0%, #0f766e 100%)",
                color: "#ffffff",
                boxShadow: "0 10px 24px rgba(15,118,110,0.16)"
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M9 9h6" />
                <path d="M9 13h6" />
                <path d="M9 17h4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#123047", letterSpacing: "-0.02em" }}>MediVault</div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#5b7283", fontWeight: 700 }}>
                Clinic Portal
              </div>
            </div>
          </div>

          <div style={{ height: 28, width: 1, background: "#dbe4ea" }} />

          <div style={{ display: "grid", gap: 2 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#123047" }}>{clinicName}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: "#5b7283" }}>
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
                  border: "1px solid #d4dde4",
                  background: "rgba(255,255,255,0.9)",
                  color: "#123047",
                  fontWeight: 600
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
                  border: "1px solid #d4dde4",
                  background: "#ffffff",
                  color: "#123047",
                  fontWeight: 700,
                  cursor: pending ? "wait" : "pointer"
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
              background: "#123047",
              color: "#ffffff",
              fontWeight: 700
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
              border: "1px solid #d4dde4",
              background: "rgba(255,255,255,0.9)",
              color: "#123047",
              fontWeight: 700,
              cursor: pending ? "wait" : "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>
      {status ? (
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px 10px 20px", color: status.includes("Unable") || status.includes("failed") ? "#b91c1c" : "#5b7283", fontSize: 13, fontWeight: 600 }}>
          {status}
        </div>
      ) : null}
    </header>
  );
}
