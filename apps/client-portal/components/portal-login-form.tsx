"use client";

import { FormEvent, useState } from "react";

type Status = {
  state: "idle" | "pending" | "error";
  message: string;
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
    <section style={{ maxWidth: 420, padding: 24, border: "1px solid #d0d7de", borderRadius: 18, background: "#ffffff" }}>
      <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>Clinic Access</p>
      <h1 style={{ marginBottom: 8 }}>Sign in to Medivault</h1>
      <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.6 }}>
        Use your clinic account to open the portal and manage billing from your assigned clinic context.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            style={{ padding: 10, border: "1px solid #d1d5db", borderRadius: 10 }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            style={{ padding: 10, border: "1px solid #d1d5db", borderRadius: 10 }}
          />
        </label>
        <button
          type="submit"
          disabled={status.state === "pending"}
          style={{
            padding: "12px 16px",
            borderRadius: 999,
            border: "none",
            background: "#0f766e",
            color: "white",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {status.state === "pending" ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {status.state === "error" ? <p style={{ marginTop: 16, color: "#b91c1c" }}>{status.message}</p> : null}
    </section>
  );
}
