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
  padding: "16px 18px",
  borderRadius: 999,
  border: "1px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(255,255,255,0.08)",
  color: "#f2eadf",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
  fontFamily: bodyFont
};

const mutedText: CSSProperties = {
  color: "rgba(240, 230, 216, 0.44)"
};

const ambientCard: CSSProperties = {
  padding: 14,
  borderRadius: 24,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(18px)",
  boxShadow: "0 18px 40px rgba(10,12,11,0.18)"
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
        borderRadius: 34,
        background: "linear-gradient(180deg, rgba(27,31,29,0.98) 0%, rgba(38,44,41,0.96) 100%)",
        boxShadow: "0 30px 80px rgba(8, 10, 10, 0.34)",
        fontFamily: bodyFont
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 16% 30%, rgba(197, 182, 145, 0.12), transparent 12%), radial-gradient(circle at 74% 22%, rgba(126, 149, 121, 0.16), transparent 14%), radial-gradient(circle at 56% 54%, rgba(197, 182, 145, 0.1), transparent 12%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))"
        }}
      />

      <div
        className="portal-login-nav"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 88,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(201,184,145,0.94) 0%, rgba(160,174,137,0.72) 56%, rgba(255,255,255,0.02) 78%)",
              boxShadow: "0 0 24px rgba(201,184,145,0.22)"
            }}
          />
          <div style={{ fontFamily: headingFont, fontSize: 24, letterSpacing: "0.04em", color: "#f5efe4" }}>MEDIVAULT</div>
        </div>

        <div className="portal-login-nav-links" style={{ display: "flex", gap: 32, fontSize: 14, ...mutedText }}>
          <span>Private Care</span>
          <span>Billing</span>
          <span>Membership</span>
          <span>Access</span>
        </div>
      </div>

      <div
        className="portal-login-grid"
        style={{
          position: "relative",
          minHeight: 760,
          display: "grid",
          gridTemplateColumns: "180px minmax(320px, 1fr) 220px",
          alignItems: "center",
          paddingTop: 88
        }}
      >
        <div className="portal-login-ambient-left" style={{ paddingLeft: 22, display: "grid", gap: 18 }}>
          <div style={ambientCard}>
            <div style={{ width: 90, height: 90, margin: "8px auto 10px auto", borderRadius: "50%", background: "radial-gradient(circle, rgba(126,149,121,0.44) 0%, rgba(126,149,121,0.08) 44%, rgba(126,149,121,0.03) 72%, rgba(255,255,255,0) 78%)" }} />
            <div style={{ textAlign: "center", fontSize: 13, ...mutedText }}>Secure clinical continuity</div>
          </div>
          <div style={ambientCard}>
            <div style={{ width: 80, height: 80, margin: "6px auto 10px auto", borderRadius: 20, background: "radial-gradient(circle at 30% 30%, rgba(193, 178, 141, 0.46), rgba(117, 127, 101, 0.12))" }} />
            <div style={{ textAlign: "center", fontSize: 13, ...mutedText }}>Founder access tier</div>
          </div>
        </div>

        <div className="portal-login-center" style={{ display: "grid", placeItems: "center", padding: "0 24px" }}>
          <div
            className="portal-login-card"
            style={{
              width: "min(430px, 100%)",
              padding: 34,
              borderRadius: 28,
              background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.05) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 0 0 1px rgba(198,184,146,0.06), 0 24px 60px rgba(8,10,10,0.26)"
            }}
          >
            <div style={{ width: 92, height: 92, margin: "0 auto 22px auto", borderRadius: "50%", background: "linear-gradient(180deg, rgba(214,219,214,0.28) 0%, rgba(171,175,170,0.14) 100%)", display: "grid", placeItems: "center" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#dfd5c8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21a8 8 0 1 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
              <label style={{ display: "grid", gap: 8, color: "#f2eadf", fontSize: 14, fontWeight: 500 }}>
                Username / Email
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="Username / Email" style={fieldStyle} />
              </label>

              <label style={{ display: "grid", gap: 8, color: "#f2eadf", fontSize: 14, fontWeight: 500 }}>
                Password
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required placeholder="Password" style={fieldStyle} />
              </label>

              <button
                type="submit"
                disabled={status.state === "pending"}
                style={{
                  marginTop: 12,
                  padding: "16px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(230, 220, 191, 0.28)",
                  background: "linear-gradient(180deg, rgba(198,184,146,0.96) 0%, rgba(172,156,121,0.92) 100%)",
                  color: "#202521",
                  fontWeight: 600,
                  fontSize: 17,
                  cursor: status.state === "pending" ? "wait" : "pointer",
                  boxShadow: "0 12px 28px rgba(10,12,11,0.24)",
                  fontFamily: bodyFont
                }}
              >
                {status.state === "pending" ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="portal-login-foot" style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 16, fontSize: 13, ...mutedText }}>
              <span>Secure practice access</span>
              <span>Forgot Password?</span>
            </div>

            {status.state === "error" ? (
              <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 16, background: "rgba(120, 52, 52, 0.26)", border: "1px solid rgba(190, 112, 112, 0.28)", color: "#f6d4d4", fontSize: 14, fontWeight: 600 }}>
                {status.message}
              </div>
            ) : null}
          </div>
        </div>

        <div className="portal-login-ambient-right" style={{ paddingRight: 22, display: "grid", gap: 18 }}>
          <div style={ambientCard}>
            <div style={{ fontSize: 15, marginBottom: 10, ...mutedText }}>Concierge support</div>
            <div style={{ width: 96, height: 96, margin: "0 auto 10px auto", borderRadius: 24, background: "radial-gradient(circle, rgba(126,149,121,0.18), rgba(126,149,121,0.04))" }} />
            <div style={{ fontSize: 13, textAlign: "center", ...mutedText }}>Quiet and focused</div>
          </div>
          <div style={ambientCard}>
            <div style={{ fontSize: 15, marginBottom: 10, ...mutedText }}>Protected billing</div>
            <div style={{ width: 110, height: 110, margin: "0 auto 10px auto", borderRadius: "50%", background: "radial-gradient(circle, rgba(193,178,141,0.32) 0%, rgba(193,178,141,0.08) 46%, rgba(193,178,141,0.03) 72%, rgba(255,255,255,0) 78%)" }} />
            <div style={{ fontSize: 13, textAlign: "center", ...mutedText }}>Membership continuity</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input::placeholder {
          color: rgba(242, 234, 223, 0.42);
        }

        @media (max-width: 980px) {
          .portal-login-grid {
            grid-template-columns: 1fr !important;
            padding: 112px 22px 28px 22px !important;
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
            height: 74px !important;
            padding: 0 18px !important;
          }

          .portal-login-grid {
            padding: 92px 14px 18px 14px !important;
          }

          .portal-login-card {
            padding: 24px !important;
            border-radius: 24px !important;
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