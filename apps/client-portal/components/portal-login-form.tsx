"use client";

import { CSSProperties, FormEvent, useState } from "react";

type Status = {
  state: "idle" | "pending" | "error";
  message: string;
};

const headingFont = 'Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif';
const bodyFont = 'Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif';

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(163, 185, 196, 0.7)",
  background: "rgba(255,255,255,0.94)",
  color: "#14303a",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: bodyFont
};

const mutedText: CSSProperties = {
  color: "#69818b"
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
      className="portal-login-shell"
      style={{
        width: "min(1280px, 100%)",
        minHeight: 760,
        position: "relative",
        overflow: "hidden",
        borderRadius: 30,
        background: "linear-gradient(90deg, #eef8fb 0%, #edf7fa 48%, #10253f 48%, #122846 100%)",
        boxShadow: "0 28px 80px rgba(24, 43, 59, 0.18)",
        fontFamily: bodyFont
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 15% 78%, rgba(101, 199, 215, 0.22), transparent 20%), radial-gradient(circle at 72% 20%, rgba(71, 138, 196, 0.16), transparent 18%), radial-gradient(circle at 86% 78%, rgba(49, 104, 160, 0.22), transparent 24%)"
        }}
      />

      <div
        className="portal-login-nav"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 78,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          zIndex: 2
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "linear-gradient(180deg, #1dd5d9 0%, #1cb8c2 100%)",
              boxShadow: "0 10px 22px rgba(29, 213, 217, 0.28)"
            }}
          />
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0d2330" }}>MediVault Pro</div>
        </div>

        <div className="portal-login-nav-links" style={{ display: "flex", gap: 24, fontSize: 13, color: "rgba(241,248,252,0.82)" }}>
          <span>Clinic Portal</span>
          <span>Billing</span>
          <span>Security</span>
          <span>Support</span>
        </div>
      </div>

      <div
        className="portal-login-grid"
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: 760,
          display: "grid",
          gridTemplateColumns: "minmax(380px, 0.95fr) minmax(480px, 1.05fr)",
          paddingTop: 78
        }}
      >
        <div
          className="portal-login-left"
          style={{
            position: "relative",
            padding: "54px 34px 34px 34px",
            display: "grid",
            alignContent: "space-between",
            gap: 22
          }}
        >
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#2d5361", letterSpacing: "0.02em" }}>Clinic Name</div>
            <div
              style={{
                width: "min(520px, 100%)",
                padding: 28,
                borderRadius: 28,
                background: "rgba(255,255,255,0.58)",
                border: "1px solid rgba(255,255,255,0.72)",
                boxShadow: "0 24px 54px rgba(113, 156, 175, 0.18)",
                backdropFilter: "blur(12px)"
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: "#112c36" }}>MediVault Pro</div>
              <div style={{ marginTop: 6, fontSize: 16, color: "#426271" }}>Clinic billing and secure subscription access</div>

              <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(177,197,206,0.72)", color: "#31525f", fontSize: 13, fontWeight: 600 }}>HIPAA Aligned</div>
                <div style={{ padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(177,197,206,0.72)", color: "#31525f", fontSize: 13, fontWeight: 600 }}>24/7 Billing Access</div>
              </div>

              <div
                className="portal-login-card"
                style={{
                  marginTop: 28,
                  width: "min(320px, 100%)",
                  padding: 24,
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(187,204,212,0.8)",
                  boxShadow: "0 18px 42px rgba(96, 131, 147, 0.18)"
                }}
              >
                <div style={{ fontSize: 17, fontWeight: 700, color: "#183540" }}>Clinic Portal</div>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="Email" style={fieldStyle} />
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required placeholder="Password" style={fieldStyle} />

                  <button
                    type="submit"
                    disabled={status.state === "pending"}
                    style={{
                      marginTop: 4,
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: "1px solid rgba(22, 200, 208, 0.68)",
                      background: "linear-gradient(180deg, #24d6dc 0%, #1ebfc6 100%)",
                      color: "#f7fffe",
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: status.state === "pending" ? "wait" : "pointer",
                      boxShadow: "0 14px 28px rgba(30, 191, 198, 0.28)",
                      fontFamily: bodyFont
                    }}
                  >
                    {status.state === "pending" ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, ...mutedText }}>
                  <span>Passwordless Login</span>
                  <span>Sign In</span>
                </div>

                {status.state === "error" ? (
                  <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 14, background: "rgba(254,242,242,0.98)", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 14, fontWeight: 600 }}>
                    {status.message}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="portal-login-cert-row" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ padding: "10px 16px", borderRadius: 999, background: "rgba(255,255,255,0.82)", border: "1px solid rgba(177,197,206,0.72)", color: "#31525f", fontSize: 13, fontWeight: 600 }}>ISO 27001</div>
            <div style={{ padding: "10px 16px", borderRadius: 999, background: "rgba(255,255,255,0.82)", border: "1px solid rgba(177,197,206,0.72)", color: "#31525f", fontSize: 13, fontWeight: 600 }}>SOC 2</div>
          </div>
        </div>

        <div
          className="portal-login-right"
          style={{
            padding: "48px 28px 28px 12px",
            display: "grid",
            alignContent: "center"
          }}
        >
          <div style={{ color: "#f3f8fb", fontSize: 18, fontWeight: 700, marginBottom: 18, maxWidth: 440 }}>
            Clinician and client portal with clear billing, renewal history, and operational visibility.
          </div>

          <div
            style={{
              borderRadius: 26,
              background: "linear-gradient(180deg, #142c48 0%, #10243c 100%)",
              border: "1px solid rgba(74, 108, 145, 0.48)",
              boxShadow: "0 26px 56px rgba(4, 16, 29, 0.34)",
              overflow: "hidden"
            }}
          >
            <div style={{ height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", borderBottom: "1px solid rgba(65, 92, 121, 0.46)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#d9eff3", fontWeight: 700 }}>
                <div style={{ width: 28, height: 28, borderRadius: 10, background: "linear-gradient(180deg, #1dd5d9 0%, #1cb8c2 100%)" }} />
                <span>MediVault Pro</span>
              </div>
              <div style={{ width: 210, height: 30, borderRadius: 999, background: "rgba(255,255,255,0.92)" }} />
            </div>

            <div className="portal-login-dashboard" style={{ display: "grid", gridTemplateColumns: "160px 1fr", minHeight: 420 }}>
              <div style={{ padding: 16, borderRight: "1px solid rgba(65, 92, 121, 0.46)", display: "grid", alignContent: "start", gap: 10 }}>
                {[
                  ["Dashboard", false],
                  ["Billing", true],
                  ["Invoices", false],
                  ["Messages", false],
                  ["Settings", false]
                ].map(([label, active]) => (
                  <div
                    key={label}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: active ? "linear-gradient(180deg, #23d7dc 0%, #1ebfc6 100%)" : "transparent",
                      color: active ? "#08242d" : "#d4e4ec",
                      fontWeight: 600,
                      fontSize: 14
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div style={{ padding: 16, display: "grid", gap: 12 }}>
                <div style={{ padding: 18, borderRadius: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(73, 103, 133, 0.4)", minHeight: 92 }}>
                  <div style={{ color: "#f4fbfd", fontWeight: 700, marginBottom: 10 }}>Clinic Overview</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(197,224,234,0.78))" }} />
                    ))}
                  </div>
                </div>

                <div className="portal-login-mini-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                  <div style={{ padding: 14, borderRadius: 18, background: "linear-gradient(180deg, rgba(33,210,215,0.18) 0%, rgba(20,44,72,0.88) 100%)", border: "1px solid rgba(55, 110, 143, 0.52)", minHeight: 116 }}>
                    <div style={{ color: "#e7f7fb", fontWeight: 700 }}>Renewal Status</div>
                    <div style={{ marginTop: 14, color: "#8adce0", fontSize: 26, fontWeight: 700 }}>Active</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(73, 103, 133, 0.4)", minHeight: 116 }}>
                    <div style={{ color: "#e7f7fb", fontWeight: 700 }}>Payment Timeline</div>
                    <div style={{ marginTop: 18, height: 42, borderRadius: 10, background: "linear-gradient(180deg, rgba(37,215,220,0.18), rgba(255,255,255,0.02))" }} />
                  </div>
                  <div style={{ padding: 14, borderRadius: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(73, 103, 133, 0.4)", minHeight: 116 }}>
                    <div style={{ color: "#e7f7fb", fontWeight: 700 }}>Quick Actions</div>
                    <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                      <div style={{ height: 34, borderRadius: 10, background: "rgba(255,255,255,0.88)" }} />
                      <div style={{ height: 34, borderRadius: 10, background: "rgba(35,215,220,0.92)" }} />
                    </div>
                  </div>
                </div>

                <div className="portal-login-bottom-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                  <div style={{ padding: 14, borderRadius: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(73, 103, 133, 0.4)", minHeight: 120 }} />
                  <div style={{ padding: 14, borderRadius: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(73, 103, 133, 0.4)", minHeight: 120 }} />
                  <div style={{ padding: 14, borderRadius: 18, background: "linear-gradient(180deg, rgba(255,171,74,0.16) 0%, rgba(255,255,255,0.06) 100%)", border: "1px solid rgba(124, 112, 82, 0.4)", minHeight: 120 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input::placeholder {
          color: #8ca2ac;
        }

        @media (max-width: 1080px) {
          .portal-login-grid {
            grid-template-columns: 1fr !important;
          }

          .portal-login-right {
            padding: 0 22px 24px 22px !important;
          }

          .portal-login-left {
            padding-bottom: 24px !important;
          }
        }

        @media (max-width: 760px) {
          .portal-login-shell {
            min-height: auto !important;
            background: linear-gradient(180deg, #eef8fb 0%, #edf7fa 54%, #10253f 54%, #122846 100%) !important;
          }

          .portal-login-nav {
            height: 72px !important;
            padding: 0 18px !important;
          }

          .portal-login-nav-links {
            display: none !important;
          }

          .portal-login-left {
            padding: 88px 16px 20px 16px !important;
          }

          .portal-login-right {
            padding: 0 16px 16px 16px !important;
          }

          .portal-login-dashboard {
            grid-template-columns: 1fr !important;
          }

          .portal-login-mini-grid,
          .portal-login-bottom-grid {
            grid-template-columns: 1fr !important;
          }

          .portal-login-cert-row {
            padding-bottom: 8px;
          }
        }
      `}</style>
    </section>
  );
}
