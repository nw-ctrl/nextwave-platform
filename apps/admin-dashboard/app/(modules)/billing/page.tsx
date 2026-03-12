"use client";

import { FormEvent, useEffect, useState } from "react";

type BillingProfile = {
  id: string;
  client_id: string;
  provider: string;
  mode: "platform" | "client" | string;
  stripe_account_id: string | null;
  stripe_customer_id: string | null;
  key_ref: string | null;
  webhook_secret_ref: string | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Status = { state: "idle" | "pending" | "success" | "error"; message: string };

const initialForm = {
  actorUserId: "",
  clientId: "",
  mode: "platform",
  stripeAccountId: "",
  stripeCustomerId: "",
  keyRef: "",
  webhookSecretRef: "",
  metadata: '{\n  "scope": "platform",\n  "note": "Optional JSON metadata"\n}'
};

const initialCheckoutForm = {
  clientId: "",
  customerEmail: ""
};

function safeParseMetadata(value: string) {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export default function Page() {
  const [profiles, setProfiles] = useState<BillingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [checkoutForm, setCheckoutForm] = useState(initialCheckoutForm);
  const [status, setStatus] = useState<Status>({ state: "idle", message: "" });
  const [checkoutStatus, setCheckoutStatus] = useState<Status>({ state: "idle", message: "" });

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/profiles", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setProfiles(Array.isArray(data?.items) ? data.items : []);
      } else {
        setStatus({ state: "error", message: "Unable to load billing profiles" });
      }
    } catch (error) {
      setStatus({ state: "error", message: (error as Error)?.message ?? "Profiles fetch failed" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckoutChange = (field: keyof typeof checkoutForm, value: string) => {
    setCheckoutForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.clientId.trim()) {
      setStatus({ state: "error", message: "clientId is required" });
      return;
    }
    if (!form.actorUserId.trim()) {
      setStatus({ state: "error", message: "actor user id (x-actor-user-id) is required" });
      return;
    }
    setStatus({ state: "pending", message: "Saving billing profile..." });
    const payload: Record<string, unknown> = {
      clientId: form.clientId.trim(),
      mode: form.mode,
      metadata: safeParseMetadata(form.metadata)
    };

    if (form.stripeAccountId.trim()) {
      payload.stripeAccountId = form.stripeAccountId.trim();
    }
    if (form.stripeCustomerId.trim()) {
      payload.stripeCustomerId = form.stripeCustomerId.trim();
    }
    if (form.keyRef.trim()) {
      payload.keyRef = form.keyRef.trim();
    }
    if (form.webhookSecretRef.trim()) {
      payload.webhookSecretRef = form.webhookSecretRef.trim();
    }

    try {
      const response = await fetch("/api/billing/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-user-id": form.actorUserId.trim()
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        const message = typeof result?.error === "string" ? result.error : "Saving failed";
        setStatus({ state: "error", message });
        return;
      }
      setStatus({ state: "success", message: "Billing profile saved" });
      setForm((prev) => ({ ...prev, stripeAccountId: "", stripeCustomerId: "" }));
      loadProfiles();
    } catch (error) {
      setStatus({ state: "error", message: (error as Error)?.message ?? "Submit error" });
    }
  };

  const handleStartCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.actorUserId.trim()) {
      setCheckoutStatus({ state: "error", message: "actor user id (x-actor-user-id) is required" });
      return;
    }
    if (!checkoutForm.clientId.trim()) {
      setCheckoutStatus({ state: "error", message: "clientId is required for Medivault checkout" });
      return;
    }

    setCheckoutStatus({ state: "pending", message: "Creating Medivault checkout session..." });

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-user-id": form.actorUserId.trim()
        },
        body: JSON.stringify({
          clientId: checkoutForm.clientId.trim(),
          customerEmail: checkoutForm.customerEmail.trim() || undefined,
          appId: "medivault"
        })
      });

      const result = await response.json();
      if (!response.ok || !result?.url) {
        const message = typeof result?.error === "string" ? result.error : "Unable to create Stripe checkout session";
        setCheckoutStatus({ state: "error", message });
        return;
      }

      setCheckoutStatus({ state: "success", message: "Redirecting to Stripe Checkout..." });
      window.location.href = result.url;
    } catch (error) {
      setCheckoutStatus({ state: "error", message: (error as Error)?.message ?? "Checkout session failed" });
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui", maxWidth: 1180 }}>
      <h1>Billing Control Center</h1>
      <p>Use this panel to keep Stripe billing profiles aligned and to start Medivault clinic subscriptions from the admin workflow.</p>
      <p>Medivault plan target: PKR 4000 / month via Stripe recurring price configured in admin env.</p>

      <section style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <form
          onSubmit={handleStartCheckout}
          style={{
            border: "1px solid #d0d7de",
            borderRadius: 12,
            padding: 16,
            minWidth: 320
          }}
        >
          <h2>Start Medivault Checkout</h2>
          <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.5 }}>
            For onboarded clinics only. This flow reuses or creates the clinic&apos;s Stripe customer, then opens Stripe Checkout for the PKR monthly plan.
          </p>
          <label style={{ display: "block", marginBottom: 8 }}>
            Actor user id (x-actor-user-id)
            <input
              type="text"
              value={form.actorUserId}
              onChange={(event) => handleChange("actorUserId", event.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            Clinic client ID
            <input
              type="text"
              value={checkoutForm.clientId}
              onChange={(event) => handleCheckoutChange("clientId", event.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            Billing email (optional)
            <input
              type="email"
              value={checkoutForm.customerEmail}
              onChange={(event) => handleCheckoutChange("customerEmail", event.target.value)}
              placeholder="clinic-admin@example.com"
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          <button
            type="submit"
            style={{
              marginTop: 12,
              padding: "10px 16px",
              borderRadius: 6,
              border: "none",
              background: "#059669",
              color: "white",
              cursor: "pointer"
            }}
          >
            Start PKR 4000/month checkout
          </button>
          {checkoutStatus.state !== "idle" && (
            <p style={{ marginTop: 12, color: checkoutStatus.state === "error" ? "#b91c1c" : "#09572d" }}>{checkoutStatus.message}</p>
          )}
        </form>

        <form
          onSubmit={handleSubmit}
          style={{
            border: "1px solid #d0d7de",
            borderRadius: 12,
            padding: 16,
            minWidth: 320
          }}
        >
          <h2>Create / Update Profile</h2>
          <label style={{ display: "block", marginBottom: 8 }}>
            Actor user id (x-actor-user-id)
            <input
              type="text"
              value={form.actorUserId}
              onChange={(event) => handleChange("actorUserId", event.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            Client ID
            <input
              type="text"
              value={form.clientId}
              onChange={(event) => handleChange("clientId", event.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            Mode
            <select
              value={form.mode}
              onChange={(event) => handleChange("mode", event.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            >
              <option value="platform">platform</option>
              <option value="client">client</option>
            </select>
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            `key_ref`
            <input
              type="text"
              placeholder="Examples: env:STRIPE_SECRET_KEY"
              value={form.keyRef}
              onChange={(event) => handleChange("keyRef", event.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            `webhook_secret_ref`
            <input
              type="text"
              placeholder="Examples: env:STRIPE_WEBHOOK_SECRET"
              value={form.webhookSecretRef}
              onChange={(event) => handleChange("webhookSecretRef", event.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            Stripe Account ID (optional)
            <input
              type="text"
              value={form.stripeAccountId}
              onChange={(event) => handleChange("stripeAccountId", event.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            Stripe Customer ID (optional)
            <input
              type="text"
              value={form.stripeCustomerId}
              onChange={(event) => handleChange("stripeCustomerId", event.target.value)}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            Metadata JSON
            <textarea
              rows={6}
              value={form.metadata}
              onChange={(event) => handleChange("metadata", event.target.value)}
              style={{ width: "100%", marginTop: 4, fontFamily: "ui-monospace, monospace" }}
            />
          </label>
          <button
            type="submit"
            style={{
              marginTop: 12,
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#2563eb",
              color: "white",
              cursor: "pointer"
            }}
          >
            Save profile
          </button>
          {status.state !== "idle" && (
            <p style={{ marginTop: 12, color: status.state === "error" ? "#b91c1c" : "#09572d" }}>{status.message}</p>
          )}
        </form>
      </section>

      <section style={{ marginTop: 24, border: "1px solid #d0d7de", borderRadius: 12, padding: 16 }}>
        <h2>Existing profiles</h2>
        {loading ? (
          <p>Loading profiles...</p>
        ) : profiles.length === 0 ? (
          <p>No active billing profiles yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14
              }}
            >
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", paddingBottom: 4 }}>clientId</th>
                  <th style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", paddingBottom: 4 }}>mode</th>
                  <th style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", paddingBottom: 4 }}>stripeCustomerId</th>
                  <th style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", paddingBottom: 4 }}>key_ref / webhook_secret_ref</th>
                  <th style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", paddingBottom: 4 }}>updated_at</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td style={{ padding: "6px 0" }}>{profile.client_id}</td>
                    <td style={{ padding: "6px 0" }}>{profile.mode}</td>
                    <td style={{ padding: "6px 0" }}>{profile.stripe_customer_id ?? "-"}</td>
                    <td style={{ padding: "6px 0" }}>
                      {profile.key_ref ?? "-"}
                      <br />
                      <small>{profile.webhook_secret_ref ?? "-"}</small>
                    </td>
                    <td style={{ padding: "6px 0" }}>{new Date(profile.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
