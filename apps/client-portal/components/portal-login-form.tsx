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
  border: "1px solid rgba(128, 167, 191, 0.7)",
  background: "rgba(255,255,255,0.9)",
  color: "#0d2432",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: bodyFont,
  transition: "border 0.2s ease"
};

const mutedText: CSSProperties = {
  color: "#9fb8c5"
};

const navItems = ["Clinic Portal", "Billing", "Security", "Support"] as const;

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
    <section className="portal-login-shell">
      <div className="portal-login-grid">
        <div className="portal-login-panel">
          <div className="portal-login-header">
            <div className="portal-login-stage">Concierge Clinic Access</div>
            <h1>MediVault Portal</h1>
            <p>Enter your clinic credentials to open the billing, membership, and workspace control center.</p>
          </div>

          <form onSubmit={handleSubmit} className="portal-login-form">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              placeholder="Email"
              style={fieldStyle}
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              placeholder="Password"
              style={fieldStyle}
            />
            <button type="submit" disabled={status.state === "pending"} className="portal-login-submit">
              {status.state === "pending" ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {status.state === "error" ? (
            <div className="portal-login-status" role="alert">
              {status.message}
            </div>
          ) : null}

          <div className="portal-login-footer">
            <span style={mutedText}>All interactions are protected with 256-bit encryption.</span>
          </div>
        </div>

        <div className="portal-login-art">
          <div className="portal-login-art-overlay" />
          <div className="portal-login-art-copy">
            <div className="portal-login-art-label">Luxury medical SaaS</div>
            <h2>Calm control for modern clinics</h2>
            <p>
              The portal blends operational clarity with a boutique wellness feel so your clinic feels trusted from the very
              first click.
            </p>
            <div className="portal-login-art-tags">
              {navItems.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .portal-login-shell {
          width: min(1280px, 100%);
          min-height: 720px;
          margin: 0 auto;
          border-radius: 32px;
          background: radial-gradient(circle at 22% 20%, rgba(63, 166, 190, 0.25), transparent 45%),
            linear-gradient(135deg, #081523 0%, #050b18 68%, #01040c 100%);
          box-shadow: 0 35px 90px rgba(3, 11, 25, 0.9);
          position: relative;
          overflow: hidden;
          font-family: Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif;
          color: #edf7ff;
        }

        .portal-login-grid {
          display: grid;
          grid-template-columns: minmax(320px, 0.95fr) minmax(420px, 1.05fr);
          gap: 30px;
          padding: 58px;
          position: relative;
          z-index: 1;
        }

        .portal-login-panel {
          padding: 52px 48px;
          border-radius: 32px;
          background: rgba(7, 18, 32, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 24px 52px rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(24px);
          display: grid;
          gap: 20px;
        }

        .portal-login-stage {
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(132, 185, 209, 0.9);
        }

        .portal-login-header h1 {
          margin: 4px 0 0;
          font-size: 36px;
          letter-spacing: -0.02em;
          font-family: Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif;
          font-weight: 700;
        }

        .portal-login-header p {
          margin: 0;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          max-width: 360px;
          line-height: 1.6;
        }

        .portal-login-form {
          display: grid;
          gap: 12px;
        }

        .portal-login-submit {
          margin-top: 4px;
          padding: 14px 16px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(180deg, #22d6dc 0%, #16a1b2 100%);
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          font-family: Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif;
          cursor: pointer;
          box-shadow: 0 14px 32px rgba(18, 158, 170, 0.45);
          transition: transform 0.25s ease;
        }

        .portal-login-submit:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .portal-login-submit:not(:disabled):hover {
          transform: translateY(-1px);
        }

        .portal-login-status {
          margin-top: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(254, 242, 242, 0.95);
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 14px;
          font-weight: 600;
        }

        .portal-login-footer {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .portal-login-art {
          position: relative;
          border-radius: 32px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(6, 18, 30, 0.96) 0%, rgba(4, 7, 12, 0.95) 70%),
            url("/assets/c0a8cb5d-f251-4fde-aa65-dc24b739b71a.png");
          background-size: cover;
          background-position: center;
          min-height: 100%;
        }

        .portal-login-art-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 35% 25%, rgba(40, 170, 199, 0.35), transparent 60%),
            radial-gradient(circle at 75% 15%, rgba(111, 236, 203, 0.25), transparent 40%),
            linear-gradient(150deg, rgba(5, 12, 25, 0.85), rgba(1, 3, 8, 0.95));
        }

        .portal-login-art-copy {
          position: relative;
          z-index: 1;
          padding: 48px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-height: 100%;
          justify-content: center;
        }

        .portal-login-art-label {
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(196, 229, 240, 0.85);
        }

        .portal-login-art h2 {
          margin: 0;
          font-size: 32px;
          line-height: 1.2;
          font-family: Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif;
          color: #f9fbff;
        }

        .portal-login-art p {
          margin: 0;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.6;
          max-width: 360px;
        }

        .portal-login-art-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .portal-login-art-tags span {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.85);
        }

        @media (max-width: 960px) {
          .portal-login-grid {
            grid-template-columns: 1fr;
            padding: 42px;
          }

          .portal-login-art-copy {
            padding: 32px;
          }

          .portal-login-panel {
            padding: 42px;
          }
        }

        @media (max-width: 640px) {
          .portal-login-shell {
            min-height: auto;
            border-radius: 24px;
          }

          .portal-login-grid {
            padding: 28px;
          }

          .portal-login-panel {
            padding: 32px 24px;
          }

          .portal-login-art-copy {
            padding: 28px;
          }
        }
      `}</style>
    </section>
  );
}
