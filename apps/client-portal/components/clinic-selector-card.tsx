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

  const isError = status.includes("Unable") || status.includes("failed");

  return (
    <section className="selector-card">
      <div className="selector-header">
        <div>
          <p className="selector-eyebrow">Clinic Context</p>
          <h2>Choose your clinic</h2>
        </div>
        <button type="button" onClick={handleLogout} className="selector-logout">
          Sign out
        </button>
      </div>
      <p className="selector-copy">Your portal session can switch between clinics you are assigned to.</p>
      <div className="selector-form">
        <select value={clientId} onChange={(event) => setClientId(event.target.value)} className="selector-select">
          {memberships.map((item) => (
            <option key={item.clientId} value={item.clientId}>
              {item.clinicName} ({item.role})
            </option>
          ))}
        </select>
        <button type="button" onClick={handleSelect} className="selector-submit">
          Use this clinic
        </button>
        {status ? <p className={`selector-status ${isError ? "error" : ""}`}>{status}</p> : null}
      </div>
      <style jsx>{`
        .selector-card {
          max-width: 720px;
          width: 100%;
          box-sizing: border-box;
          padding: clamp(18px, 3vw, 24px);
          border: 1px solid #d0d7de;
          border-radius: 20px;
          background: #ffffff;
        }

        .selector-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .selector-eyebrow {
          margin: 0;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
        }

        .selector-header h2 {
          margin: 8px 0 0;
        }

        .selector-copy {
          margin-top: 12px;
          color: #4b5563;
          line-height: 1.6;
        }

        .selector-form {
          display: grid;
          gap: 12px;
        }

        .selector-select,
        .selector-submit,
        .selector-logout {
          min-height: 44px;
          font-size: 16px;
        }

        .selector-select {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          background: #fff;
        }

        .selector-submit {
          width: 100%;
          padding: 12px 16px;
          border-radius: 999px;
          border: none;
          background: #111827;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .selector-logout {
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          background: #fff;
          cursor: pointer;
          white-space: nowrap;
        }

        .selector-status {
          margin: 0;
          color: #4b5563;
        }

        .selector-status.error {
          color: #b91c1c;
        }

        @media (max-width: 640px) {
          .selector-header {
            flex-direction: column;
            align-items: stretch;
          }

          .selector-logout {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
