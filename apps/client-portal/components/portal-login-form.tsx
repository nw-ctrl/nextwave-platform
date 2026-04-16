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
  padding: "15px 18px",
  borderRadius: 18,
  border: "1px solid rgba(149, 162, 179, 0.35)",
  background: "#f9fbfc",
  color: "#102132",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: bodyFont,
  transition: "border 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
};

const mutedText: CSSProperties = {
  color: "#6b7280",
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
          <p>Sign in to access patient records, clinical documentation, billing oversight, and role-governed practice operations.</p>
        </div>

        <div className="portal-login-summary">
          <div className="portal-login-summary-item">
            <span>Workspace</span>
            <strong>Clinical operations</strong>
          </div>
          <div className="portal-login-summary-item">
            <span>Access model</span>
            <strong>Role-aware controls</strong>
          </div>
          <div className="portal-login-summary-item portal-login-highlight">
            <span>Practice scope</span>
            <strong>Documentation and oversight</strong>
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
          width: min(560px, 100%);
          margin: 0 auto;
          padding: 20px;
          font-family: ${headingFont};
        }

        .portal-login-panel {
          padding: clamp(28px, 4vw, 42px);
          border-radius: 34px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(246,250,252,0.78) 100%),
            radial-gradient(circle at top left, rgba(41,184,199,0.12), transparent 40%);
          border: 1px solid rgba(255, 255, 255, 0.76);
          box-shadow: 0 26px 70px rgba(16, 33, 50, 0.12);
          backdrop-filter: blur(26px);
          display: grid;
          gap: 20px;
        }

        .portal-login-top h1 {
          margin: 4px 0 6px;
          font-size: clamp(32px, 4vw, 38px);
          letter-spacing: -0.02em;
          font-family: ${headingFont};
          font-weight: 700;
          color: #102132;
        }

        .portal-login-stage {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0f9db4;
          font-weight: 700;
        }

        .portal-login-top p {
          margin: 0;
          font-size: 15px;
          color: #536273;
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
          border: 1px solid rgba(255, 255, 255, 0.74);
          background: rgba(255, 255, 255, 0.74);
          display: grid;
          gap: 4px;
          box-shadow: 0 10px 24px rgba(16, 33, 50, 0.06);
          backdrop-filter: blur(18px);
        }

        .portal-login-highlight {
          background: linear-gradient(180deg, #eefbfc 0%, #f7fbfc 100%);
          border-color: rgba(15, 157, 180, 0.22);
        }

        .portal-login-summary-item span {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #7d8b99;
        }

        .portal-login-summary-item strong {
          font-size: 14px;
          color: #102132;
        }

        .portal-login-form {
          display: grid;
          gap: 14px;
        }

        .portal-login-submit {
          margin-top: 4px;
          padding: 15px 16px;
          border: none;
          border-radius: 18px;
          background: linear-gradient(180deg, #1bb8cf 0%, #1297b0 100%);
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          font-family: ${headingFont};
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(18, 151, 176, 0.22);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .portal-login-submit:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .portal-login-submit:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 36px rgba(18, 151, 176, 0.32);
        }

        .portal-login-status {
          margin-top: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(248, 113, 113, 0.12);
          border: 1px solid rgba(248, 113, 113, 0.28);
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
