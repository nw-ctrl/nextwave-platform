"use client";

import { CSSProperties, FormEvent, startTransition, useState } from "react";
import { useRouter } from "next/navigation";

type Status = {
  state: "idle" | "pending" | "error";
  message: string;
};

const headingFont = "Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif";
const bodyFont = "Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif";

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#f8fafc",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: bodyFont,
  transition: "border 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  backdropFilter: "blur(18px)",
};

const mutedText: CSSProperties = {
  color: "#94a3b8",
};

export function PortalLoginForm() {
  const router = useRouter();
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
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(typeof result?.error === "string" ? result.error : "Unable to sign in");
      }

      startTransition(() => {
        router.replace("/");
        router.refresh();
      });
    } catch (error) {
      setStatus({ state: "error", message: error instanceof Error ? error.message : "Sign-in failed" });
    }
  }

  return (
    <section className="portal-login-shell">
      <div className="portal-login-panel">
      <div className="portal-login-top">
          <div className="portal-login-stage">Secure Clinical Access</div>
          <h1>MediFlow Portal</h1>
          <p>Sign in to access patient records, prescription workflows, clinic settings, and role-governed operational tools.</p>
        </div>

        <div className="portal-login-summary">
          <div className="portal-login-summary-item">
            <span>Clinical workspace</span>
            <strong>Role-aware access</strong>
          </div>
          <div className="portal-login-summary-item">
            <span>Portal posture</span>
            <strong>Secure operations</strong>
          </div>
          <div className="portal-login-summary-item portal-login-highlight">
            <span>Prescription setup</span>
            <strong>Doctor-ready templates</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="portal-login-form">
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="Email" style={fieldStyle} />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required placeholder="Password" style={fieldStyle} />
          <button type="submit" disabled={status.state === "pending"} className="portal-login-submit">
            {status.state === "pending" ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {status.state === "error" ? <div className="portal-login-status" role="alert">{status.message}</div> : null}

        <div className="portal-login-footer">
          <span style={mutedText}>All portal access is protected with encrypted transport and session controls.</span>
        </div>
      </div>

      <style jsx>{`
        .portal-login-shell {
          width: min(540px, 100%);
          margin: 0 auto;
          padding: 20px;
          font-family: ${headingFont};
        }

        .portal-login-panel {
          position: relative;
          padding: clamp(26px, 4vw, 40px);
          border-radius: 32px;
          background: #f3f2fa;
          border: 1px solid rgba(124, 58, 237, 0.25);
          box-shadow: 0 32px 70px rgba(15, 23, 42, 0.2);
          display: grid;
          gap: 18px;
        }

        .portal-login-panel::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 1px solid rgba(124, 58, 237, 0.25);
          pointer-events: none;
        }

        .portal-login-top h1 {
          margin: 4px 0 6px;
          font-size: clamp(32px, 4vw, 38px);
          letter-spacing: -0.02em;
          font-family: ${headingFont};
          font-weight: 700;
          color: #1f1b4d;
        }

        .portal-login-stage {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #7c3aed;
        }

        .portal-login-top p {
          margin: 0;
          font-size: 15px;
          color: #4b5563;
          max-width: 44ch;
          line-height: 1.6;
        }

        .portal-login-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .portal-login-summary-item {
          padding: 14px 16px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.8);
          display: grid;
          gap: 4px;
        }

        .portal-login-highlight {
          background: rgba(124, 58, 237, 0.08);
          border-color: rgba(124, 58, 237, 0.3);
        }

        .portal-login-summary-item span {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #6b7280;
        }

        .portal-login-summary-item strong {
          font-size: 14px;
          color: #1f1b4d;
        }

        .portal-login-form {
          display: grid;
          gap: 12px;
        }

        .portal-login-submit {
          margin-top: 4px;
          padding: 14px 16px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(180deg, #7c3aed 0%, #4c1d95 100%);
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          font-family: ${headingFont};
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(76, 29, 149, 0.25);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .portal-login-submit:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .portal-login-submit:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 36px rgba(76, 29, 149, 0.35);
        }

        .portal-login-status {
          margin-top: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(248, 113, 113, 0.15);
          border: 1px solid rgba(248, 113, 113, 0.4);
          color: #be123c;
          font-size: 14px;
          font-weight: 600;
        }

        .portal-login-footer {
          font-size: 12px;
          color: #6b7280;
        }

        @media (max-width: 960px) {
          .portal-login-panel {
            padding: 28px 24px;
          }
          .portal-login-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .portal-login-shell {
            width: 100%;
            padding: 12px;
          }
          .portal-login-top h1 {
            font-size: 30px;
          }
          .portal-login-summary-item strong {
            font-size: 14px;
          }
          .portal-login-submit {
            width: 100%;
            min-height: 48px;
          }
          .portal-login-panel {
            padding: 24px 18px;
            border-radius: 22px;
          }
          .portal-login-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
