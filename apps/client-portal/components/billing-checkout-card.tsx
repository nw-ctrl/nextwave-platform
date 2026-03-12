"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  clientId: string;
  userId: string;
  role: string | null;
  clinicName: string;
};

type Status = { state: "idle" | "pending" | "success" | "error"; message: string };

export function BillingCheckoutCard({ clientId, userId, role, clinicName }: Props) {
  const searchParams = useSearchParams();
  const [customerEmail, setCustomerEmail] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle", message: "" });

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      setStatus({ state: "success", message: "Payment setup completed. Your subscription is being updated." });
      return;
    }
    if (checkout === "cancel") {
      setStatus({ state: "error", message: "Checkout was canceled before payment confirmation." });
      return;
    }
    setStatus({ state: "idle", message: "" });
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "pending", message: "Preparing your secure checkout..." });

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          userId,
          customerEmail: customerEmail.trim() || undefined
        })
      });

      const result = await response.json();
      if (!response.ok || !result?.url) {
        throw new Error(typeof result?.error === "string" ? result.error : "Unable to create checkout session");
      }

      window.location.href = result.url;
    } catch (error) {
      setStatus({ state: "error", message: error instanceof Error ? error.message : "Checkout failed" });
    }
  }

  return (
    <section style={{ padding: 24, border: "1px solid #d0d7de", borderRadius: 16, maxWidth: 720 }}>
      <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>Medivault Billing</p>
      <h1 style={{ marginBottom: 8 }}>{clinicName}</h1>
      <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.6 }}>
        Start the monthly Medivault subscription for your clinic. This checkout is tied to your clinic account and billing profile.
      </p>
      <div style={{ display: "grid", gap: 8, marginBottom: 16, color: "#111827" }}>
        <div><strong>Plan</strong>: PKR 4000 / month</div>
        <div><strong>Role</strong>: {role ?? "unknown"}</div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Billing email (optional)
          <input
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="clinic-admin@example.com"
            style={{ padding: 10, border: "1px solid #d1d5db", borderRadius: 10 }}
          />
        </label>
        <button
          type="submit"
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
          Continue to secure payment
        </button>
      </form>
      {status.state !== "idle" ? (
        <p style={{ marginTop: 16, color: status.state === "error" ? "#b91c1c" : "#065f46" }}>{status.message}</p>
      ) : null}
    </section>
  );
}
