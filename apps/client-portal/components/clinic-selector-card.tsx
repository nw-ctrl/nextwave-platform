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
};

export function ClinicSelectorCard({ memberships, selectedClientId }: Props) {
  const [clientId, setClientId] = useState(selectedClientId ?? memberships[0]?.clientId ?? "");
  const [status, setStatus] = useState("");

  async function handleSelect() {
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
      setStatus(error instanceof Error ? error.message : "Clinic selection failed");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <section style={{ maxWidth: 720, padding: 24, border: "1px solid #d0d7de", borderRadius: 18, background: "#ffffff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>Clinic Context</p>
          <h2 style={{ marginBottom: 8 }}>Choose your clinic</h2>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{ padding: "10px 14px", borderRadius: 999, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>
      <p style={{ marginTop: 0, color: "#4b5563" }}>Your portal session can switch between clinics you are assigned to.</p>
      <div style={{ display: "grid", gap: 12 }}>
        <select
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
          style={{ padding: 10, border: "1px solid #d1d5db", borderRadius: 10 }}
        >
          {memberships.map((item) => (
            <option key={item.clientId} value={item.clientId}>
              {item.clinicName} ({item.role})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSelect}
          style={{
            padding: "12px 16px",
            borderRadius: 999,
            border: "none",
            background: "#111827",
            color: "white",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Use this clinic
        </button>
        {status ? <p style={{ margin: 0, color: status.includes("Unable") || status.includes("failed") ? "#b91c1c" : "#4b5563" }}>{status}</p> : null}
      </div>
    </section>
  );
}
