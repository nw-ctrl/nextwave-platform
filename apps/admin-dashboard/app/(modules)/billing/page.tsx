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

type Clinic = {
  id: string;
  name: string;
};

type Status = { state: "idle" | "pending" | "success" | "error"; message: string };

const initialForm = {
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
  customerEmail: "",
  couponId: "",
  priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || ""
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
  const [globalActorUserId, setGlobalActorUserId] = useState("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  
  const [profiles, setProfiles] = useState<BillingProfile[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [appPromos, setAppPromos] = useState<any[]>([]); // New state for App Promos
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  const [form, setForm] = useState(initialForm);
  const [checkoutForm, setCheckoutForm] = useState(initialCheckoutForm);
  const [usageForm, setUsageForm] = useState({ clientId: "" });
  const [grantForm, setGrantForm] = useState({ 
    clientId: "", 
    plan: "Standard", 
    durationDays: "7", 
    reason: "Founding doctor trial extension" 
  });
  
  // Stripe Coupon Form
  const [couponForm, setCouponForm] = useState({ 
    name: "", 
    promoCodeText: "", 
    percentOff: "", 
    duration: "once", 
    durationInMonths: "" 
  });

  // App Promo Code Form
  const [appPromoForm, setAppPromoForm] = useState({ 
    code: "", 
    free_months: 6, 
    plan_tier: "Premium" 
  });

  const [status, setStatus] = useState<Status>({ state: "idle", message: "" });
  const [checkoutStatus, setCheckoutStatus] = useState<Status>({ state: "idle", message: "" });
  const [usageStatus, setUsageStatus] = useState<Status>({ state: "idle", message: "" });
  const [couponStatus, setCouponStatus] = useState<Status>({ state: "idle", message: "" });
  const [appPromoStatus, setAppPromoStatus] = useState<Status>({ state: "idle", message: "" });
  const [grantStatus, setGrantStatus] = useState<Status>({ state: "idle", message: "" });
  
  const [usageData, setUsageData] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const getClinic = (clientId: string) => {
    return clinics.find((c) => c.id === clientId) || null;
  };

  const handleSelectClinic = (clientId: string) => {
    setForm(prev => ({ ...prev, clientId }));
    setCheckoutForm(prev => ({ ...prev, clientId }));
    setUsageForm({ clientId });
    setGrantForm(prev => ({ ...prev, clientId }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loads INSTANTLY without needing the Superuser ID
  const loadClinics = async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClinics(data?.items || []);
      }
    } catch (e) {
      console.error("Failed to load clinics", e);
    }
  };

  // Loads INSTANTLY without needing the Superuser ID
  const loadProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const response = await fetch("/api/billing/profiles", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setProfiles(Array.isArray(data?.items) ? data.items : []);
      }
    } catch (error) {
      console.error("Profiles fetch failed");
    } finally {
      setLoadingProfiles(false);
    }
  };

  // These ONLY load when a Superuser ID is entered
  const loadCoupons = async () => {
    try {
      const resp = await fetch("/api/billing/coupons", { 
        headers: { "x-actor-user-id": globalActorUserId.trim() } 
      });
      if (resp.ok) {
        const data = await resp.json();
        setCoupons(data.items ?? []);
      }
    } catch (e) {
      console.error("Coupons load failed", e);
    }
  };

  const loadAppPromos = async () => {
    try {
      const resp = await fetch("/api/billing/app-promo", { 
        headers: { "x-actor-user-id": globalActorUserId.trim() } 
      });
      if (resp.ok) {
        const data = await resp.json();
        setAppPromos(data.items ?? []);
      }
    } catch (e) {
      console.error("App Promos load failed", e);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const resp = await fetch("/api/subscriptions", { 
        headers: { "x-actor-user-id": globalActorUserId.trim() } 
      });
      if (resp.ok) {
        const data = await resp.json();
        setSubscriptions(data.items ?? []);
      }
    } catch (e) {
      console.error("Subscriptions load failed", e);
    }
  };

  // 1. Initial Page Load
  useEffect(() => {
    loadClinics();
    loadProfiles();
    
    const savedActorId = localStorage.getItem("billing_actor_user_id");
    if (savedActorId) {
      setGlobalActorUserId(savedActorId);
    }
  }, []);

  // 2. Trigger Protected Loads when Admin ID is typed
  useEffect(() => {
    if (globalActorUserId.trim()) {
      localStorage.setItem("billing_actor_user_id", globalActorUserId);
      loadCoupons();
      loadAppPromos();
      loadSubscriptions();
    } else {
      setCoupons([]);
      setAppPromos([]);
      setSubscriptions([]);
    }
  }, [globalActorUserId]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleCheckoutChange = (field: keyof typeof checkoutForm, value: string) => {
    setCheckoutForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!globalActorUserId.trim()) return setStatus({ state: "error", message: "Global admin user ID is required" });
    if (!form.clientId.trim()) return setStatus({ state: "error", message: "Clinic is required" });

    setStatus({ state: "pending", message: "Saving billing profile..." });
    const payload: Record<string, unknown> = {
      clientId: form.clientId.trim(),
      mode: form.mode,
      metadata: safeParseMetadata(form.metadata)
    };
    
    if (form.stripeAccountId.trim()) payload.stripeAccountId = form.stripeAccountId.trim();
    if (form.stripeCustomerId.trim()) payload.stripeCustomerId = form.stripeCustomerId.trim();
    if (form.keyRef.trim()) payload.keyRef = form.keyRef.trim();
    if (form.webhookSecretRef.trim()) payload.webhookSecretRef = form.webhookSecretRef.trim();

    try {
      const response = await fetch("/api/billing/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-user-id": globalActorUserId.trim() },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) return setStatus({ state: "error", message: result.error || "Saving failed" });
      
      setStatus({ state: "success", message: "Billing profile saved" });
      setForm((prev) => ({ ...prev, stripeAccountId: "", stripeCustomerId: "" }));
      loadProfiles();
    } catch (error) {
      setStatus({ state: "error", message: (error as Error)?.message ?? "Submit error" });
    }
  };

  const handleStartCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!globalActorUserId.trim()) return setCheckoutStatus({ state: "error", message: "Global admin ID required" });
    if (!checkoutForm.clientId.trim()) return setCheckoutStatus({ state: "error", message: "Clinic is required" });
    if (!checkoutForm.priceId) return setCheckoutStatus({ state: "error", message: "Plan Tier is required" });

    setCheckoutStatus({ state: "pending", message: "Creating Medivault checkout session..." });

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-user-id": globalActorUserId.trim() },
        body: JSON.stringify({
          clientId: checkoutForm.clientId.trim(),
          customerEmail: checkoutForm.customerEmail.trim() || undefined,
          couponId: checkoutForm.couponId || undefined,
          priceId: checkoutForm.priceId,
          appId: "medivault"
        })
      });
      const result = await response.json();
      if (!response.ok || !result?.url) return setCheckoutStatus({ state: "error", message: result.error || "Failed to create checkout" });

      setCheckoutStatus({ state: "success", message: "Redirecting..." });
      window.location.href = result.url;
    } catch (error) {
      setCheckoutStatus({ state: "error", message: (error as Error)?.message ?? "Session failed" });
    }
  };

  const handleLookupUsage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!globalActorUserId.trim()) return setUsageStatus({ state: "error", message: "Global admin ID required" });
    if (!usageForm.clientId.trim()) return setUsageStatus({ state: "error", message: "Clinic is required" });

    setUsageStatus({ state: "pending", message: "Scanning database..." });
    setUsageData(null);

    try {
      const response = await fetch(`/api/usage/${usageForm.clientId.trim()}`, {
        headers: { "x-actor-user-id": globalActorUserId.trim() }
      });
      const result = await response.json();
      if (!response.ok) return setUsageStatus({ state: "error", message: result?.error ?? "Fetch failed" });

      setUsageData(result);
      setUsageStatus({ state: "success", message: "Scan complete" });
    } catch (error) {
      setUsageStatus({ state: "error", message: "API connection failed" });
    }
  };

  const handleCreateCoupon = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!globalActorUserId.trim()) return setCouponStatus({ state: "error", message: "Global admin ID required" });
    
    setCouponStatus({ state: "pending", message: "Creating Stripe coupon..." });
    setGeneratedCode(null);
    try {
      const resp = await fetch("/api/billing/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-user-id": globalActorUserId.trim() },
        body: JSON.stringify({
          name: couponForm.name,
          promoCodeText: couponForm.promoCodeText,
          percentOff: parseInt(couponForm.percentOff) || undefined,
          duration: couponForm.duration,
          durationInMonths: parseInt(couponForm.durationInMonths) || undefined
        })
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Coupon creation failed");
      
      setGeneratedCode(result.promoCode || null);
      setCouponStatus({ state: "success", message: "Stripe Coupon created" });
      setCouponForm({ name: "", promoCodeText: "", percentOff: "", duration: "once", durationInMonths: "" });
      loadCoupons();
    } catch (e) {
      setCouponStatus({ state: "error", message: (e as Error).message });
    }
  };

  const handleGenerateAppPromo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!globalActorUserId.trim()) return setAppPromoStatus({ state: "error", message: "Global admin ID required" });
    
    setAppPromoStatus({ state: "pending", message: "Generating App Promo Code..." });
    try {
      const resp = await fetch("/api/billing/app-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-user-id": globalActorUserId.trim() },
        body: JSON.stringify(appPromoForm)
      });
      
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to create code");
      
      setAppPromoStatus({ state: "success", message: `Code ${data.code} generated!` });
      setAppPromoForm({ code: "", free_months: 6, plan_tier: "Premium" });
      loadAppPromos();
    } catch (e: any) {
      setAppPromoStatus({ state: "error", message: e.message });
    }
  };

  const handleGrantAccess = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!globalActorUserId.trim()) return setGrantStatus({ state: "error", message: "Global admin ID required" });
    if (!grantForm.clientId.trim()) return setGrantStatus({ state: "error", message: "Clinic is required" });

    setGrantStatus({ state: "pending", message: "Granting access..." });
    try {
      const resp = await fetch("/api/billing/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-user-id": globalActorUserId.trim() },
        body: JSON.stringify(grantForm)
      });
      if (!resp.ok) throw new Error("Access grant failed");
      
      setGrantStatus({ state: "success", message: "Access granted successfully" });
      loadSubscriptions();
    } catch (e) {
      setGrantStatus({ state: "error", message: (e as Error).message });
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui", maxWidth: 1180 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Billing Control Center</h1>
          <p style={{ marginTop: 8, color: "#4b5563" }}>
            Manage Stripe billing profiles, coupons, App Promo codes, usage, and manual subscription overrides.
          </p>
        </div>
        
        <div style={{ background: "#fef3c7", padding: "12px 16px", borderRadius: 12, border: "1px solid #f59e0b", minWidth: 320 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#92400e" }}>
            Acting Superuser ID (Required for Action)
          </label>
          <input
            type="text"
            placeholder="Paste your UUID here..."
            value={globalActorUserId}
            onChange={(e) => setGlobalActorUserId(e.target.value)}
            style={{ width: "100%", marginTop: 6, padding: 8, borderRadius: 6, border: "1px solid #fbbf24" }}
          />
        </div>
      </div>

      <section style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", marginBottom: 40 }}>
        
        {/* USAGE LOOKUP */}
        <form onSubmit={handleLookupUsage} style={{ border: "1px solid #d0d7de", borderRadius: 12, padding: 16 }}>
          <h2>Oversight: Usage Scan</h2>
          <label style={{ display: "block", marginBottom: 12 }}>
            Select Clinic Context
            <select
              value={usageForm.clientId}
              onChange={(e) => setUsageForm({ clientId: e.target.value })}
              style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
            >
              <option value="">-- Choose a clinic --</option>
              {clinics.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name || 'Unnamed Clinic'}
                </option>
              ))}
            </select>
          </label>
          
          <button type="submit" style={{ width: "100%", padding: "10px", borderRadius: 6, border: "none", background: "#111827", color: "white", cursor: "pointer" }}>
            Scan Usage
          </button>

          {usageData && (
            <div style={{ marginTop: 16, background: "#f9fafb", padding: 12, borderRadius: 8, fontSize: 13, border: "1px solid #e5e7eb" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                 <span>Patients:</span> <strong>{usageData.patientCount}</strong>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                 <span>Visits:</span> <strong>{usageData.visitCount}</strong>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                 <span>Storage:</span> <strong>{(usageData.storageBytes / (1024 * 1024)).toFixed(2)} MB</strong>
               </div>
            </div>
          )}
          {usageStatus.state !== "idle" && <p style={{ marginTop: 12, fontSize: 13, color: usageStatus.state === "error" ? "#b91c1c" : "#059669" }}>{usageStatus.message}</p>}
        </form>

        {/* STRIPE CHECKOUT */}
        <form onSubmit={handleStartCheckout} style={{ border: "1px solid #d0d7de", borderRadius: 12, padding: 16, minWidth: 320 }}>
          <h2>Start Medivault Checkout</h2>
          <label style={{ display: "block", marginBottom: 8 }}>
            Target Clinic Context
            <select
              value={checkoutForm.clientId}
              onChange={(e) => handleCheckoutChange("clientId", e.target.value)}
              style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
            >
              <option value="">-- Choose a clinic --</option>
              {clinics.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name || 'Unnamed Clinic'}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Plan Tier
            <select 
              value={checkoutForm.priceId} 
              onChange={(e) => handleCheckoutChange("priceId", e.target.value)}
              style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
              required
            >
              <option value="">Select a plan...</option>
              <option value={process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC}>Basic (PKR 2,490)</option>
              <option value={process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD}>Standard (PKR 4,750)</option>
              <option value={process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM}>Premium (PKR 6,700)</option>
            </select>
          </label>
          
          <label style={{ display: "block", marginBottom: 8 }}>
            Admin / Billing Email (optional)
            <input
              type="email"
              value={checkoutForm.customerEmail}
              onChange={(e) => handleCheckoutChange("customerEmail", e.target.value)}
              placeholder="clinic-admin@example.com"
              style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
            />
          </label>
          
          <label style={{ display: "block", marginBottom: 8 }}>
            Apply Discount Coupon (optional)
            <select
              value={checkoutForm.couponId}
              onChange={(e) => handleCheckoutChange("couponId", e.target.value)}
              style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
            >
              <option value="">-- No coupon --</option>
              {coupons.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.percent_off}% off)</option>
              ))}
            </select>
          </label>
          
          <button type="submit" style={{ marginTop: 12, padding: "10px", borderRadius: 6, border: "none", background: "#059669", color: "white", cursor: "pointer", width: "100%" }}>
            Start Checkout flow
          </button>
          {checkoutStatus.state !== "idle" && <p style={{ marginTop: 12, fontSize: 13, color: checkoutStatus.state === "error" ? "#b91c1c" : "#09572d" }}>{checkoutStatus.message}</p>}
        </form>

        {/* CREATE/UPDATE BILLING PROFILE */}
        <form onSubmit={handleSubmit} style={{ border: "1px solid #d0d7de", borderRadius: 12, padding: 16, minWidth: 320 }}>
          <h2>Link Stripe Profile</h2>
          <label style={{ display: "block", marginBottom: 8 }}>
            Target Clinic Context
            <select
              value={form.clientId}
              onChange={(e) => handleChange("clientId", e.target.value)}
              style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
            >
              <option value="">-- Choose a clinic --</option>
              {clinics.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name || 'Unnamed Clinic'}
                </option>
              ))}
            </select>
          </label>
          
          <label style={{ display: "block", marginBottom: 8 }}>
            Mode
            <select
              value={form.mode}
              onChange={(e) => handleChange("mode", e.target.value)}
              style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
            >
              <option value="platform">Platform Mode (Default)</option>
              <option value="client">Client-Direct Mode</option>
            </select>
          </label>
          
          <button type="submit" style={{ marginTop: 12, padding: "10px", borderRadius: 6, border: "none", background: "#2563eb", color: "white", cursor: "pointer", width: "100%" }}>
            Save profile
          </button>
          {status.state !== "idle" && <p style={{ marginTop: 12, fontSize: 13, color: status.state === "error" ? "#b91c1c" : "#09572d" }}>{status.message}</p>}
        </form>
      </section>

      {/* DISCOUNTS AND PROMOS */}
      <section style={{ marginTop: 24, border: "1px solid #d0d7de", borderRadius: 12, padding: 16 }}>
        <h2>Promotions & Coupons</h2>
        <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr" }}>
          
          {/* APP PROMO CODES (NEW) */}
          <div>
            <form onSubmit={handleGenerateAppPromo} style={{ display: "grid", gap: 12, alignContent: "start", marginBottom: 24, padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: 0 }}>Generate App Promo Code</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Bypasses Stripe for instant free access.</p>
              
              <label style={{ display: "block" }}>
                Custom Code
                <input type="text" value={appPromoForm.code} onChange={(e) => setAppPromoForm({ ...appPromoForm, code: e.target.value.toUpperCase() })} placeholder="LAUNCH100 (Optional)" style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }} />
              </label>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label>
                  Plan Tier
                  <select value={appPromoForm.plan_tier} onChange={(e) => setAppPromoForm({ ...appPromoForm, plan_tier: e.target.value })} style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}>
                    <option value="Premium">Premium</option>
                    <option value="Standard">Standard</option>
                    <option value="Basic">Basic</option>
                  </select>
                </label>
                <label>
                  Free Months
                  <input type="number" value={appPromoForm.free_months} onChange={(e) => setAppPromoForm({ ...appPromoForm, free_months: parseInt(e.target.value) || 1 })} style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }} />
                </label>
              </div>
              
              <button type="submit" disabled={appPromoStatus.state === "pending"} style={{ padding: "10px", borderRadius: 6, border: "none", background: "#0ea5e9", color: "white", cursor: "pointer", marginTop: 8 }}>Generate App Promo</button>
              {appPromoStatus.state !== "idle" && <p style={{ fontSize: 13, color: appPromoStatus.state === "error" ? "#b91c1c" : "#0369a1" }}>{appPromoStatus.message}</p>}
            </form>

            {/* List App Promos */}
            <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
              {appPromos.length === 0 ? (
                <p style={{ padding: 16, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No App Promos active.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                   <thead style={{ background: "#f9fafb", position: "sticky", top: 0 }}>
                     <tr>
                       <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Code</th>
                       <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Tier</th>
                       <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Months</th>
                       <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Status</th>
                     </tr>
                   </thead>
                   <tbody>
                     {appPromos.map((p: any) => (
                       <tr key={p.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                         <td style={{ padding: "8px 12px", fontWeight: 600 }}>{p.code}</td>
                         <td style={{ padding: "8px 12px" }}>{p.plan_tier}</td>
                         <td style={{ padding: "8px 12px" }}>{p.free_months}</td>
                         <td style={{ padding: "8px 12px" }}>{p.is_used ? "Used" : "Available"}</td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              )}
            </div>
          </div>

          {/* STRIPE COUPONS (EXISTING) */}
          <div>
            <form onSubmit={handleCreateCoupon} style={{ display: "grid", gap: 12, alignContent: "start", marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}>Generate Stripe Discount</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Creates checkout discounts requiring a credit card.</p>
              <label style={{ display: "block" }}>
                Internal Name
                <input type="text" value={couponForm.name} onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })} placeholder="Founding Doctor 20% Off" style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }} required />
              </label>
              <label style={{ display: "block" }}>
                Promo Code
                <input type="text" value={couponForm.promoCodeText} onChange={(e) => setCouponForm({ ...couponForm, promoCodeText: e.target.value })} placeholder="DOC50" style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db", textTransform: "uppercase" }} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label>
                  Percent Off
                  <input type="number" value={couponForm.percentOff} onChange={(e) => setCouponForm({ ...couponForm, percentOff: e.target.value })} placeholder="20" style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }} required />
                </label>
                <label>
                  Duration
                  <select value={couponForm.duration} onChange={(e) => setCouponForm({ ...couponForm, duration: e.target.value })} style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}>
                    <option value="once">Once</option>
                    <option value="forever">Forever</option>
                    <option value="repeating">Repeating</option>
                  </select>
                </label>
              </div>
              {couponForm.duration === "repeating" && (
                <label>
                  Months
                  <input type="number" value={couponForm.durationInMonths} onChange={(e) => setCouponForm({ ...couponForm, durationInMonths: e.target.value })} placeholder="12" style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }} />
                </label>
              )}
              <button type="submit" disabled={couponStatus.state === "pending"} style={{ padding: "10px", borderRadius: 6, border: "none", background: "#0f766e", color: "white", cursor: "pointer", marginTop: 8 }}>Generate Stripe Coupon</button>
              {generatedCode && (
                <div style={{ marginTop: 8, padding: 12, background: "#ecfdf5", border: "1px solid #059669", borderRadius: 8 }}>
                  <p style={{ margin: "0 0 8px 0", color: "#065f46", fontSize: 13 }}>Share code with doctor:</p>
                  <code style={{ fontSize: 16, fontWeight: "bold", background: "white", padding: "4px 8px", border: "1px solid #a7f3d0", display: "block", textAlign: "center" }}>{generatedCode}</code>
                </div>
              )}
            </form>

            <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
              {!globalActorUserId.trim() ? (
                <p style={{ padding: 16, textAlign: "center", color: "#9ca3af" }}>⚠️ Enter your Superuser ID.</p>
              ) : coupons.length === 0 ? (
                <p style={{ padding: 16, textAlign: "center", color: "#9ca3af" }}>No Stripe coupons found.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                   <thead style={{ background: "#f9fafb", position: "sticky", top: 0 }}>
                     <tr>
                       <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Name</th>
                       <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Value</th>
                       <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Duration</th>
                     </tr>
                   </thead>
                   <tbody>
                     {coupons.map((c: any) => (
                       <tr key={c.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                         <td style={{ padding: "8px 12px" }}>{c.name}</td>
                         <td style={{ padding: "8px 12px" }}>{c.percent_off}% off</td>
                         <td style={{ padding: "8px 12px" }}>{c.duration}</td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* MANAGED SUBSCRIPTIONS */}
      <section style={{ marginTop: 24, border: "1px solid #d0d7de", borderRadius: 12, padding: 16 }}>
        <h2>Managed Subscriptions (Overrides)</h2>
        <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr" }}>
          
          <form onSubmit={handleGrantAccess} style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <label style={{ display: "block" }}>
              Target Clinic Context
              <select
                value={grantForm.clientId}
                onChange={(e) => setGrantForm({ ...grantForm, clientId: e.target.value })}
                style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
                required
              >
                <option value="">-- Choose a clinic --</option>
                {clinics.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name || 'Unnamed Clinic'}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label>
                Plan Level
                <select value={grantForm.plan} onChange={(e) => setGrantForm({ ...grantForm, plan: e.target.value })} style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}>
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </label>
              <label>
                Days Active
                <input type="number" value={grantForm.durationDays} onChange={(e) => setGrantForm({ ...grantForm, durationDays: e.target.value })} placeholder="7" style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }} required />
              </label>
            </div>
            <label>
              Internal Reason
              <input type="text" value={grantForm.reason} onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })} placeholder="Trial extension" style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }} />
            </label>
            <button type="submit" disabled={grantStatus.state === "pending"} style={{ padding: "10px", borderRadius: 6, border: "none", background: "#7c37ad", color: "white", cursor: "pointer", marginTop: 8 }}>Grant Access Now</button>
            {grantStatus.state !== "idle" && <p style={{ fontSize: 13, color: grantStatus.state === "error" ? "#b91c1c" : "#059669" }}>{grantStatus.message}</p>}
          </form>

          <div>
            <h3>Active Subscription Records</h3>
            <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
              {!globalActorUserId.trim() ? (
                 <p style={{ padding: 16, textAlign: "center", color: "#9ca3af" }}>⚠️ Enter your Superuser ID to view active subscriptions.</p>
              ) : subscriptions.length === 0 ? (
                <p style={{ padding: 16, textAlign: "center", color: "#9ca3af" }}>No active records found.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                   <thead style={{ background: "#f9fafb", position: "sticky", top: 0 }}>
                     <tr>
                       <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Clinic Context</th>
                       <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Plan</th>
                       <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Status</th>
                     </tr>
                   </thead>
                   <tbody>
                     {subscriptions.map((s: any) => {
                       const clinic = getClinic(s.client_id);
                       return (
                       <tr key={s.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                         <td style={{ padding: "8px 12px" }}>
                            <button 
                               onClick={() => handleSelectClinic(s.client_id)} 
                               style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", padding: 0, textAlign: "left" }}
                               title={`Click to target this clinic (${s.client_id})`}
                            >
                               <div style={{ fontWeight: 600 }}>{clinic?.name || "Unknown Clinic"}</div>
                               <div style={{ fontSize: 11, color: "#6b7280" }}>ID: {s.client_id.slice(0,12)}...</div>
                            </button>
                         </td>
                         <td style={{ padding: "8px 12px" }}>{s.plan}</td>
                         <td style={{ padding: "8px 12px" }}>
                           <span style={{ 
                             background: s.provider === "manual" ? "#f5f3ff" : "#ecfdf5", 
                             color: s.provider === "manual" ? "#5b21b6" : "#065f46", 
                             padding: "2px 6px", borderRadius: 4, fontWeight: 500 
                           }}>
                             {s.status}
                           </span>
                         </td>
                       </tr>
                     )})}
                   </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PROFILES TABLE */}
      <section style={{ marginTop: 24, border: "1px solid #d0d7de", borderRadius: 12, padding: 16 }}>
        <h2>Existing Profiles</h2>
        {loadingProfiles ? (
          <p>Loading profiles...</p>
        ) : profiles.length === 0 ? (
          <p>No active billing profiles yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", paddingBottom: 4 }}>Clinic Context</th>
                  <th style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", paddingBottom: 4 }}>Mode</th>
                  <th style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", paddingBottom: 4 }}>Stripe Cust ID</th>
                  <th style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", paddingBottom: 4 }}>Updated At</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => {
                  const clinic = getClinic(profile.client_id);
                  return (
                  <tr key={profile.id}>
                    <td style={{ padding: "8px 0" }}>
                        <button 
                            onClick={() => handleSelectClinic(profile.client_id)} 
                            style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", padding: 0, textAlign: "left" }}
                            title={`Click to target this clinic (${profile.client_id})`}
                        >
                            <div style={{ fontWeight: 600 }}>{clinic?.name || "Unknown Clinic"}</div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>ID: {profile.client_id.slice(0,12)}...</div>
                        </button>
                    </td>
                    <td style={{ padding: "8px 0" }}>
                        <span style={{ padding: "2px 8px", background: "#f3f4f6", borderRadius: 12, fontSize: 12 }}>
                            {profile.mode}
                        </span>
                    </td>
                    <td style={{ padding: "8px 0", fontFamily: "monospace", color: "#4b5563" }}>
                      {profile.stripe_customer_id ?? "-"}
                    </td>
                    <td style={{ padding: "8px 0", fontSize: 13, color: "#6b7280" }}>
                      {new Date(profile.updated_at).toLocaleString()}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
