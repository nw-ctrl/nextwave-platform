"use client";

import { CSSProperties, FormEvent, useState } from "react";

type Status = {
  state: "idle" | "pending" | "error";
  message: string;
};

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box"
};

const panelStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.88)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.12)",
  backdropFilter: "blur(14px)"
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
        width: "min(1080px, 100%)",
        display: "flex",
        flexWrap: "wrap",
        borderRadius: 32,
        overflow: "hidden",
        ...panelStyle
      }}
    >
      <div
        style={{
          flex: "1 1 560px",
          position: "relative",
          padding: 36,
          background: "linear-gradient(145deg, #0f172a 0%, #0f766e 52%, #dff6f1 180%)",
          color: "#ffffff",
          display: "grid",
          gap: 24,
          alignContent: "space-between",
          minHeight: 620
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 28%), radial-gradient(circle at bottom left, rgba(45,212,191,0.18), transparent 24%)",
            pointerEvents: "none"
          }}
        />

        <div style={{ position: "relative", display: "grid", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.24)",
                display: "grid",
                placeItems: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)"
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M9 9h6" />
                <path d="M9 13h6" />
                <path d="M9 17h4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>MediVault</div>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.72)", fontWeight: 700 }}>
                Clinic Operations Portal
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "inline-flex", width: "fit-content", padding: "7px 12px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Secure Clinical Access
            </div>
            <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1.02, letterSpacing: "-0.04em", maxWidth: 540 }}>
              Billing, records, and clinic operations in one trusted workspace.
            </h1>
            <p style={{ margin: 0, maxWidth: 560, color: "rgba(255,255,255,0.8)", fontSize: 17, lineHeight: 1.7 }}>
              Sign in to manage your MediVault subscription, review invoices, and access clinic tools from a portal designed for real medical operations.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
            {[
              { title: "Subscription Control", text: "Check package, cycle date, and invoice history without leaving the portal." },
              { title: "Clinic Context", text: "Open the portal inside the exact clinic membership assigned to your account." },
              { title: "Protected Access", text: "Secure sign-in flow connected to your existing clinic user credentials." }
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: 16,
                  borderRadius: 20,
                  background: "rgba(15, 23, 42, 0.2)",
                  border: "1px solid rgba(255,255,255,0.14)"
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.76)" }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 12
          }}
        >
          {[
            { label: "Portal", value: "Live clinic access" },
            { label: "Billing", value: "Managed securely" },
            { label: "Support", value: "Medical workflow aligned" }
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: 14,
                borderRadius: 18,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.12)"
              }}
            >
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.66)", fontWeight: 700 }}>{item.label}</div>
              <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: "1 1 380px",
          minWidth: 320,
          padding: 36,
          background: "linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(255,255,255,0.98) 100%)",
          display: "grid",
          alignContent: "center"
        }}
      >
        <div style={{ display: "grid", gap: 24 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0f766e", fontWeight: 800 }}>Clinic Access</p>
            <h2 style={{ margin: "8px 0 0 0", fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.03em", color: "#0f172a" }}>
              Sign in to your portal
            </h2>
            <p style={{ margin: "10px 0 0 0", color: "#475569", lineHeight: 1.7, fontSize: 15 }}>
              Use your clinic account to continue into MediVault. Your access level and clinic billing permissions will load after sign-in.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 8, color: "#334155", fontSize: 14, fontWeight: 600 }}>
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

            <label style={{ display: "grid", gap: 8, color: "#334155", fontSize: 14, fontWeight: 600 }}>
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
                borderRadius: 16,
                border: "none",
                background: "linear-gradient(135deg, #0f172a 0%, #0f766e 100%)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 15,
                cursor: status.state === "pending" ? "wait" : "pointer",
                boxShadow: "0 18px 28px rgba(15, 118, 110, 0.22)"
              }}
            >
              {status.state === "pending" ? "Signing in..." : "Open Clinic Portal"}
            </button>
          </form>

          {status.state === "error" ? (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: 14,
                fontWeight: 600
              }}
            >
              {status.message}
            </div>
          ) : null}

          <div
            style={{
              display: "grid",
              gap: 10,
              padding: 18,
              borderRadius: 20,
              background: "#f8fafc",
              border: "1px solid #e2e8f0"
            }}
          >
            <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "#0f766e", fontWeight: 800 }}>
              What happens after sign-in
            </div>
            <div style={{ color: "#475569", lineHeight: 1.7, fontSize: 14 }}>
              Clinic users with one membership go straight into billing. Multi-clinic users land in the main portal and can switch clinic context before opening modules.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
