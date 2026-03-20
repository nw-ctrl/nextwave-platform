"use client";

import { CSSProperties, FormEvent, useState } from "react";

type Status = {
  state: "idle" | "pending" | "error";
  message: string;
};

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "15px 16px",
  borderRadius: 18,
  border: "1px solid rgba(148, 163, 184, 0.28)",
  background: "rgba(255,255,255,0.78)",
  color: "#123047",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)"
};

const panelStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.52)",
  border: "1px solid rgba(255, 255, 255, 0.42)",
  boxShadow: "0 32px 80px rgba(15, 23, 42, 0.1)",
  backdropFilter: "blur(22px) saturate(140%)"
};

export function PortalLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle", message: "" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "pending", message: "Signing you in..." });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(typeof result?.error === "string" ? result.error : "Unable to sign in");
      }

      window.location.href = result?.membershipCount > 1 ? "/" : "/billing";
    } catch (error) {
      setStatus({ state: "error", message: error instanceof Error ? error.message : "Sign-in failed" });
    }
  }

  return (
    <section
      style={{
        width: "min(1040px, 100%)",
        display: "flex",
        flexWrap: "wrap",
        borderRadius: 34,
        overflow: "hidden",
        ...panelStyle
      }}
    >
      <div
        style={{
          flex: "1 1 520px",
          position: "relative",
          padding: 34,
          background: "linear-gradient(160deg, rgba(18,48,71,0.9) 0%, rgba(15,118,110,0.74) 48%, rgba(220,245,240,0.9) 170%)",
          color: "#ffffff",
          display: "grid",
          alignContent: "space-between",
          minHeight: 560
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 28%), radial-gradient(circle at 12% 82%, rgba(187,247,208,0.16), transparent 24%)",
            pointerEvents: "none"
          }}
        />

        <div style={{ position: "relative", display: "grid", gap: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 20,
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.26)",
                display: "grid",
                placeItems: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.24)"
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M9 9h6" />
                <path d="M9 13h6" />
                <path d="M9 17h4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>MediVault</div>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.76)", fontWeight: 700 }}>
                Clinic Portal
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "inline-flex", width: "fit-content", padding: "8px 13px", borderRadius: 999, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Secure clinical workspace
            </div>
            <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.04, letterSpacing: "-0.045em", maxWidth: 520 }}>
              Calm access for modern clinic operations.
            </h1>
            <p style={{ margin: 0, maxWidth: 520, color: "rgba(255,255,255,0.82)", fontSize: 16, lineHeight: 1.7 }}>
              Billing, records, and controlled access in one professional portal.
            </p>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12
          }}
        >
          {[
            { label: "Billing", value: "Clear" },
            { label: "Access", value: "Protected" },
            { label: "Portal", value: "Clinic-ready" }
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: 14,
                borderRadius: 18,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.16)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.68)", fontWeight: 700 }}>{item.label}</div>
              <div style={{ marginTop: 6, fontSize: 14, fontWeight: 800 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: "1 1 360px",
          minWidth: 320,
          padding: 34,
          background: "linear-gradient(180deg, rgba(248,250,252,0.58) 0%, rgba(255,255,255,0.76) 100%)",
          display: "grid",
          alignContent: "center"
        }}
      >
        <div style={{ display: "grid", gap: 22 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0f766e", fontWeight: 800 }}>Clinic Access</p>
            <h2 style={{ margin: "8px 0 0 0", fontSize: 32, lineHeight: 1.06, letterSpacing: "-0.035em", color: "#123047" }}>
              Sign in
            </h2>
            <p style={{ margin: "10px 0 0 0", color: "#55707f", lineHeight: 1.65, fontSize: 15 }}>
              Continue into your clinic workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 8, color: "#365062", fontSize: 14, fontWeight: 700 }}>
              Work Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                placeholder="clinic-admin@example.com"
                style={fieldStyle}
              />
            </label>

            <label style={{ display: "grid", gap: 8, color: "#365062", fontSize: 14, fontWeight: 700 }}>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                style={fieldStyle}
              />
            </label>

            <button
              type="submit"
              disabled={status.state === "pending"}
              style={{
                marginTop: 8,
                padding: "15px 18px",
                borderRadius: 18,
                border: "1px solid rgba(15,118,110,0.08)",
                background: "linear-gradient(135deg, #123047 0%, #0f766e 100%)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 15,
                cursor: status.state === "pending" ? "wait" : "pointer",
                boxShadow: "0 18px 28px rgba(15, 118, 110, 0.16)"
              }}
            >
              {status.state === "pending" ? "Signing in..." : "Open Portal"}
            </button>
          </form>

          {status.state === "error" ? (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 16,
                background: "rgba(254,242,242,0.92)",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: 14,
                fontWeight: 600
              }}
            >
              {status.message}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
