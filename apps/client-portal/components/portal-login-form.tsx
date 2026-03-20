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
  border: "1px solid rgba(142, 141, 136, 0.35)",
  background: "rgba(255,255,255,0.62)",
  color: "#4f4a43",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)",
  fontFamily: bodyFont
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
        width: "min(1160px, 100%)",
        minHeight: 760,
        position: "relative",
        overflow: "hidden",
        borderRadius: 34,
        background:
          "linear-gradient(180deg, rgba(240,236,228,0.96) 0%, rgba(232,227,219,0.92) 100%)",
        boxShadow: "0 30px 80px rgba(92, 83, 71, 0.12)",
        fontFamily: bodyFont
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 16% 36%, rgba(98, 177, 182, 0.22), transparent 12%), radial-gradient(circle at 66% 58%, rgba(103, 154, 165, 0.24), transparent 14%), radial-gradient(circle at 60% 46%, rgba(244, 214, 169, 0.22), transparent 12%), linear-gradient(180deg, rgba(255,255,255,0.38), rgba(255,255,255,0.06))"
        }}
      />

      <div
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
          background: "rgba(255,255,255,0.34)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(255,255,255,0.42)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.94) 0%, rgba(241,222,190,0.72) 40%, rgba(255,255,255,0.1) 78%)",
              boxShadow: "0 0 24px rgba(255,244,222,0.9)"
            }}
          />
          <div style={{ fontFamily: headingFont, fontSize: 24, letterSpacing: "0.04em", color: "#322f2a" }}>MEDIVAULT</div>
        </div>

        <div style={{ display: "flex", gap: 32, color: "#58544d", fontSize: 14 }}>
          <span>Sanctuary</span>
          <span>Care Team</span>
          <span>Insights</span>
          <span>Knowledge</span>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          minHeight: 760,
          display: "grid",
          gridTemplateColumns: "180px minmax(320px, 1fr) 220px",
          alignItems: "center",
          paddingTop: 88
        }}
      >
        <div style={{ paddingLeft: 22, display: "grid", gap: 18 }}>
          <div style={{ padding: 14, borderRadius: 22, background: "rgba(255,255,255,0.46)", border: "1px solid rgba(255,255,255,0.48)", backdropFilter: "blur(16px)", boxShadow: "0 18px 40px rgba(130,120,105,0.08)" }}>
            <div style={{ width: 90, height: 90, margin: "8px auto 10px auto", borderRadius: "50%", background: "radial-gradient(circle, rgba(94,170,173,0.78) 0%, rgba(94,170,173,0.2) 44%, rgba(94,170,173,0.08) 72%, rgba(255,255,255,0) 78%)" }} />
            <div style={{ textAlign: "center", color: "#5f5a53", fontSize: 13 }}>Restore calm focus</div>
          </div>
          <div style={{ padding: 14, borderRadius: 22, background: "rgba(255,255,255,0.46)", border: "1px solid rgba(255,255,255,0.48)", backdropFilter: "blur(16px)", boxShadow: "0 18px 40px rgba(130,120,105,0.08)" }}>
            <div style={{ width: 80, height: 80, margin: "6px auto 10px auto", borderRadius: 20, background: "radial-gradient(circle at 30% 30%, rgba(139, 179, 92, 0.92), rgba(91, 133, 55, 0.48))" }} />
            <div style={{ textAlign: "center", color: "#5f5a53", fontSize: 13 }}>Private care access</div>
          </div>
        </div>

        <div style={{ display: "grid", placeItems: "center", padding: "0 24px" }}>
          <div
            style={{
              width: "min(430px, 100%)",
              padding: 34,
              borderRadius: 26,
              background: "rgba(255,255,255,0.34)",
              border: "1px solid rgba(255,248,236,0.85)",
              backdropFilter: "blur(22px)",
              boxShadow: "0 0 0 1px rgba(255,226,180,0.25), 0 0 28px rgba(255,225,173,0.42), 0 28px 60px rgba(101, 91, 78, 0.1)"
            }}
          >
            <div style={{ width: 92, height: 92, margin: "0 auto 22px auto", borderRadius: "50%", background: "linear-gradient(180deg, rgba(227,232,235,0.92) 0%, rgba(199,205,210,0.72) 100%)", display: "grid", placeItems: "center" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#79736a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21a8 8 0 1 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
              <label style={{ display: "grid", gap: 8, color: "#4f4a43", fontSize: 14, fontWeight: 600 }}>
                Username / Email
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="Username / Email" style={fieldStyle} />
              </label>

              <label style={{ display: "grid", gap: 8, color: "#4f4a43", fontSize: 14, fontWeight: 600 }}>
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
                  border: "1px solid rgba(255,255,255,0.72)",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(247,244,240,0.84) 100%)",
                  color: "#2e2b27",
                  fontWeight: 500,
                  fontSize: 17,
                  cursor: status.state === "pending" ? "wait" : "pointer",
                  boxShadow: "0 8px 24px rgba(143, 131, 116, 0.12)",
                  fontFamily: bodyFont
                }}
              >
                {status.state === "pending" ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 16, fontSize: 13, color: "#5e5952" }}>
              <span>Use secure authentication</span>
              <span>Forgot Password?</span>
            </div>

            {status.state === "error" ? (
              <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 16, background: "rgba(254,242,242,0.92)", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 14, fontWeight: 600 }}>
                {status.message}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ paddingRight: 22, display: "grid", gap: 18 }}>
          <div style={{ padding: 16, borderRadius: 22, background: "rgba(255,255,255,0.48)", border: "1px solid rgba(255,255,255,0.5)", backdropFilter: "blur(16px)", boxShadow: "0 18px 40px rgba(130,120,105,0.08)" }}>
            <div style={{ fontSize: 15, color: "#3d3934", marginBottom: 10 }}>Neural Harmony</div>
            <div style={{ width: 96, height: 96, margin: "0 auto 10px auto", borderRadius: 24, background: "radial-gradient(circle, rgba(94,170,173,0.26), rgba(94,170,173,0.08))" }} />
            <div style={{ fontSize: 13, color: "#5f5a53", textAlign: "center" }}>Calm and focused</div>
          </div>
          <div style={{ padding: 16, borderRadius: 22, background: "rgba(255,255,255,0.48)", border: "1px solid rgba(255,255,255,0.5)", backdropFilter: "blur(16px)", boxShadow: "0 18px 40px rgba(130,120,105,0.08)" }}>
            <div style={{ fontSize: 15, color: "#3d3934", marginBottom: 10 }}>Breath and Sound</div>
            <div style={{ width: 110, height: 110, margin: "0 auto 10px auto", borderRadius: "50%", background: "radial-gradient(circle, rgba(94,170,173,0.78) 0%, rgba(94,170,173,0.24) 46%, rgba(94,170,173,0.08) 72%, rgba(255,255,255,0) 78%)" }} />
            <div style={{ fontSize: 13, color: "#5f5a53", textAlign: "center" }}>Ambient restoration</div>
          </div>
        </div>
      </div>
    </section>
  );
}
