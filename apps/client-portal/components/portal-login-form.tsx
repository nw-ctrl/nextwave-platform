"use client";

import { CSSProperties, FormEvent, useState } from "react";

type Status = {
  state: "idle" | "pending" | "error";
  message: string;
};

const headingFont = 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif';
const bodyFont = 'Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif';

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "15px 16px",
  borderRadius: 18,
  border: "1px solid rgba(126, 156, 168, 0.24)",
  background: "rgba(255,255,255,0.78)",
  color: "#203744",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
  fontFamily: bodyFont
};

const panelStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.48)",
  border: "1px solid rgba(255, 255, 255, 0.44)",
  boxShadow: "0 30px 90px rgba(24, 45, 58, 0.1)",
  backdropFilter: "blur(26px) saturate(145%)"
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
        width: "min(1020px, 100%)",
        display: "flex",
        flexWrap: "wrap",
        borderRadius: 36,
        overflow: "hidden",
        ...panelStyle,
        fontFamily: bodyFont
      }}
    >
      <div
        style={{
          flex: "1 1 500px",
          position: "relative",
          padding: 36,
          background: "linear-gradient(155deg, rgba(31,61,74,0.92) 0%, rgba(64,132,129,0.76) 52%, rgba(227,243,238,0.92) 170%)",
          color: "#ffffff",
          minHeight: 560,
          display: "grid",
          alignContent: "space-between"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 28%), radial-gradient(circle at 12% 82%, rgba(225,248,238,0.18), transparent 26%)",
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
                display: "grid",
                placeItems: "center",
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.24)"
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M9 9h6" />
                <path d="M9 13h6" />
                <path d="M9 17h4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>MediVault</div>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.76)", fontWeight: 700 }}>Private Clinic Portal</div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 14, maxWidth: 470 }}>
            <div style={{ display: "inline-flex", width: "fit-content", padding: "8px 13px", borderRadius: 999, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Quiet clinical luxury
            </div>
            <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.02, letterSpacing: "-0.05em", fontFamily: headingFont, fontWeight: 700 }}>
              A calmer digital front door for your clinic.
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", fontSize: 16, lineHeight: 1.7 }}>
              Secure access to billing, records, and clinic operations in a setting that feels considered rather than clinical.
            </p>
          </div>
        </div>

        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          {[
            { label: "Billing", value: "Clear" },
            { label: "Records", value: "Ready" },
            { label: "Access", value: "Protected" }
          ].map((item) => (
            <div key={item.label} style={{ padding: 14, borderRadius: 18, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.16)", textAlign: "center" }}>
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
          padding: 36,
          background: "linear-gradient(180deg, rgba(247,250,251,0.58) 0%, rgba(255,255,255,0.76) 100%)",
          display: "grid",
          alignContent: "center",
          fontFamily: bodyFont
        }}
      >
        <div style={{ display: "grid", gap: 22 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4f7d79", fontWeight: 800 }}>Clinic Access</p>
            <h2 style={{ margin: "8px 0 0 0", fontSize: 34, lineHeight: 1.04, letterSpacing: "-0.04em", color: "#203744", fontFamily: headingFont, fontWeight: 700 }}>
              Sign in
            </h2>
            <p style={{ margin: "10px 0 0 0", color: "#607985", lineHeight: 1.65, fontSize: 15 }}>
              Continue into your clinic workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 8, color: "#415c68", fontSize: 13, fontWeight: 700, letterSpacing: "0.01em" }}>
              Work Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="clinic-admin@example.com" style={fieldStyle} />
            </label>

            <label style={{ display: "grid", gap: 8, color: "#415c68", fontSize: 13, fontWeight: 700, letterSpacing: "0.01em" }}>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required placeholder="Enter your password" style={fieldStyle} />
            </label>

            <button
              type="submit"
              disabled={status.state === "pending"}
              style={{
                marginTop: 8,
                padding: "15px 18px",
                borderRadius: 18,
                border: "1px solid rgba(15,118,110,0.08)",
                background: "linear-gradient(135deg, #203744 0%, #4f7d79 100%)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 15,
                cursor: status.state === "pending" ? "wait" : "pointer",
                boxShadow: "0 16px 24px rgba(79,125,121,0.18)",
                fontFamily: bodyFont
              }}
            >
              {status.state === "pending" ? "Signing in..." : "Open Portal"}
            </button>
          </form>

          {status.state === "error" ? (
            <div style={{ padding: "12px 14px", borderRadius: 16, background: "rgba(254,242,242,0.92)", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 14, fontWeight: 600 }}>
              {status.message}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
