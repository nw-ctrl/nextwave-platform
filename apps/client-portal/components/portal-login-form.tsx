"use client";

import { CSSProperties, FormEvent, startTransition, useState } from "react";
import { useRouter } from "next/navigation";

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
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: bodyFont,
  transition: "border 0.2s ease, box-shadow 0.2s ease"
};

const mutedText: CSSProperties = {
  color: "#64748b"
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
        body: JSON.stringify({ email, password })
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
        <div className="portal-login-header">
          <div className="portal-login-stage">Secure Clinical Access</div>
          <h1>MediFlow Portal</h1>
          <p>Sign in to access your clinic workspace, account settings, and prescription operations.</p>
        </div>

        <div className="portal-login-summary">
          <div className="portal-login-summary-item">
            <span>Clinical workspace</span>
            <strong>Role-aware access</strong>
          </div>
          <div className="portal-login-summary-item">
            <span>Portal posture</span>
            <strong>Clear and secure</strong>
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
          width: min(520px, 100%);
          margin: 0 auto;
          padding: 20px;
          font-family: ${headingFont};
        }

        .portal-login-panel {
          padding: clamp(24px, 4vw, 36px);
          border-radius: 32px;
          background:
            radial-gradient(circle at top right, rgba(125, 211, 252, 0.2), transparent 34%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94));
          border: 1px solid rgba(191, 219, 254, 0.8);
          box-shadow: 0 32px 70px rgba(15, 23, 42, 0.1);
          display: grid;
          gap: 20px;
        }

        .portal-login-stage {
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #0f766e;
        }

        .portal-login-header h1 {
          margin: 4px 0 0;
          font-size: 34px;
          letter-spacing: -0.02em;
          font-family: ${headingFont};
          font-weight: 700;
          color: #0f172a;
        }

        .portal-login-header p {
          margin: 0;
          font-size: 15px;
          color: #475569;
          max-width: 40ch;
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
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          display: grid;
          gap: 4px;
        }

        .portal-login-highlight {
          background: linear-gradient(135deg, #eff6ff, #ecfeff);
          border-color: #bfdbfe;
        }

        .portal-login-summary-item span {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #64748b;
        }

        .portal-login-summary-item strong {
          font-size: 14px;
          color: #0f172a;
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
          background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          font-family: ${headingFont};
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(2, 132, 199, 0.22);
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
          color: #64748b;
        }

        @media (max-width: 960px) {
          .portal-login-panel {
            padding: 28px 24px;
          }
        }

        @media (max-width: 640px) {
          .portal-login-shell {
            width: 100%;
            padding: 12px;
          }

          .portal-login-header h1 {
            font-size: 30px;
          }

          .portal-login-header p,
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
