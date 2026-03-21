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
  padding: "15px 16px",
  borderRadius: 14,
  border: "1px solid #d1dde2",
  background: "#ffffff",
  color: "#18323c",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: bodyFont
};

const mutedText: CSSProperties = {
  color: "#657a83"
};

const sideCard: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(250, 252, 252, 0.96)",
  border: "1px solid #dde7eb"
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
        width: "min(1160px, 100%)",
        minHeight: 760,
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        background: "linear-gradient(180deg, #f4f7f8 0%, #ecf2f4 100%)",
        boxShadow: "0 20px 54px rgba(48, 73, 84, 0.08)",
        fontFamily: bodyFont
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 14% 24%, rgba(123, 160, 176, 0.1), transparent 14%), radial-gradient(circle at 80% 18%, rgba(212, 223, 228, 0.28), transparent 16%)"
        }}
      />

      <div
        className="portal-login-nav"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 76,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 26px",
          background: "rgba(247, 250, 251, 0.94)",
          borderBottom: "1px solid #dde7eb"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "#2f6773"
            }}
          />
          <div style={{ fontFamily: headingFont, fontSize: 22, letterSpacing: "0.02em", color: "#19353f", fontWeight: 700 }}>MediVault</div>
        </div>

        <div className="portal-login-nav-links" style={{ display: "flex", gap: 24, fontSize: 13, ...mutedText }}>
          <span>Clinic Portal</span>
          <span>Billing</span>
          <span>Invoices</span>
          <span>Support</span>
        </div>
      </div>

      <div
        className="portal-login-grid"
        style={{
          position: "relative",
          minHeight: 760,
          display: "grid",
          gridTemplateColumns: "220px minmax(320px, 1fr) 240px",
          alignItems: "center",
          paddingTop: 76
        }}
      >
        <div className="portal-login-ambient-left" style={{ paddingLeft: 24, display: "grid", gap: 16 }}>
          <div style={sideCard}>
            <div style={{ width: 84, height: 84, margin: "6px auto 10px auto", borderRadius: 18, background: "linear-gradient(180deg, rgba(180, 202, 212, 0.54) 0%, rgba(180, 202, 212, 0.12) 100%)" }} />
            <div style={{ textAlign: "center", fontSize: 13, ...mutedText }}>Secure clinic access</div>
          </div>
          <div style={sideCard}>
            <div style={{ width: 84, height: 84, margin: "6px auto 10px auto", borderRadius: 18, background: "linear-gradient(180deg, rgba(209, 221, 226, 0.66) 0%, rgba(209, 221, 226, 0.18) 100%)" }} />
            <div style={{ textAlign: "center", fontSize: 13, ...mutedText }}>Renewal overview</div>
          </div>
        </div>

        <div className="portal-login-center" style={{ display: "grid", placeItems: "center", padding: "0 24px" }}>
          <div
            className="portal-login-card"
            style={{
              width: "min(430px, 100%)",
              padding: 34,
              borderRadius: 22,
              background: "#ffffff",
              border: "1px solid #dde7eb",
              boxShadow: "0 18px 38px rgba(48, 73, 84, 0.08)"
            }}
          >
            <div style={{ width: 74, height: 74, margin: "0 auto 20px auto", borderRadius: 18, background: "#eef4f6", display: "grid", placeItems: "center" }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#476674" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21a8 8 0 1 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: headingFont, fontSize: 30, color: "#19353f", fontWeight: 700 }}>Clinic Access</div>
              <div style={{ marginTop: 6, fontSize: 14, ...mutedText }}>Sign in to manage billing, renewals, and payment records.</div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
              <label style={{ display: "grid", gap: 8, color: "#21404a", fontSize: 14, fontWeight: 600 }}>
                Username / Email
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="Username / Email" style={fieldStyle} />
              </label>

              <label style={{ display: "grid", gap: 8, color: "#21404a", fontSize: 14, fontWeight: 600 }}>
                Password
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required placeholder="Password" style={fieldStyle} />
              </label>

              <button
                type="submit"
                disabled={status.state === "pending"}
                style={{
                  marginTop: 12,
                  padding: "15px 18px",
                  borderRadius: 14,
                  border: "1px solid #2f6773",
                  background: "#2f6773",
                  color: "#f7fbfb",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: status.state === "pending" ? "wait" : "pointer",
                  fontFamily: bodyFont
                }}
              >
                {status.state === "pending" ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="portal-login-foot" style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 16, fontSize: 13, ...mutedText }}>
              <span>Protected practice access</span>
              <span>Need help signing in?</span>
            </div>

            {status.state === "error" ? (
              <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 16, background: "rgba(254,242,242,0.96)", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 14, fontWeight: 600 }}>
                {status.message}
              </div>
            ) : null}
          </div>
        </div>

        <div className="portal-login-ambient-right" style={{ paddingRight: 24, display: "grid", gap: 16 }}>
          <div style={sideCard}>
            <div style={{ fontSize: 15, marginBottom: 10, color: "#24414a" }}>Billing Overview</div>
            <div style={{ width: 98, height: 68, margin: "0 auto 10px auto", borderRadius: 16, background: "linear-gradient(180deg, rgba(186, 205, 213, 0.48) 0%, rgba(186, 205, 213, 0.14) 100%)" }} />
            <div style={{ fontSize: 13, textAlign: "center", ...mutedText }}>Renewals and invoices in one place</div>
          </div>
          <div style={sideCard}>
            <div style={{ fontSize: 15, marginBottom: 10, color: "#24414a" }}>Practice Support</div>
            <div style={{ width: 98, height: 68, margin: "0 auto 10px auto", borderRadius: 16, background: "linear-gradient(180deg, rgba(209, 221, 226, 0.52) 0%, rgba(209, 221, 226, 0.18) 100%)" }} />
            <div style={{ fontSize: 13, textAlign: "center", ...mutedText }}>Built for clear clinic operations</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input::placeholder {
          color: #8aa0a8;
        }

        @media (max-width: 980px) {
          .portal-login-grid {
            grid-template-columns: 1fr !important;
            padding: 104px 22px 28px 22px !important;
            min-height: auto !important;
          }

          .portal-login-ambient-left,
          .portal-login-ambient-right,
          .portal-login-nav-links {
            display: none !important;
          }

          .portal-login-center {
            padding: 0 !important;
          }
        }

        @media (max-width: 640px) {
          .portal-login-shell {
            min-height: auto !important;
            border-radius: 24px !important;
          }

          .portal-login-nav {
            height: 70px !important;
            padding: 0 18px !important;
          }

          .portal-login-grid {
            padding: 82px 14px 18px 14px !important;
          }

          .portal-login-card {
            padding: 24px !important;
            border-radius: 20px !important;
          }

          .portal-login-foot {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </section>
  );
}
