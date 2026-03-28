"use client";

import React, { useEffect, useState } from "react";

interface PricingTierProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
  ctaText?: string;
  onSelect?: () => void;
  isLoading?: boolean;
}

function PricingTier({ name, price, description, features, isPopular, isRecommended, ctaText = "Select", onSelect, isLoading }: PricingTierProps) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 24px", borderRadius: 24, background: isPopular ? "#ffffff" : "rgba(255, 255, 255, 0.72)", border: isRecommended ? "2px solid #0f766e" : isPopular ? "2px solid #d1d5db" : "1px solid #e5e7eb", boxShadow: isPopular || isRecommended ? "0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.03)" : "none", position: "relative", minWidth: 280 }}>
      {(isPopular || isRecommended) && (
        <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: isRecommended ? "#0f766e" : "#334155", color: "white", padding: "4px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {isRecommended ? "Recommended" : "Popular choice"}
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: "#111827", fontWeight: 700 }}>{name}</h3>
        <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>{description}</p>
      </div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>PKR</span>
          <span style={{ fontSize: 40, fontWeight: 800, color: "#111827" }}>{price.toLocaleString()}</span>
          <span style={{ fontSize: 16, color: "#6b7280" }}>/month</span>
        </div>
      </div>
      <ul style={{ padding: 0, margin: "0 0 32px 0", listStyle: "none", flex: 1, display: "grid", gap: 12 }}>
        {features.map((feature, i) => (
          <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "#4b5563" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, color: isRecommended ? "#0f766e" : "#334155" }}>
              <path d="M16.6667 5L7.50001 14.1667L3.33334 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button onClick={onSelect} disabled={isLoading} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: isRecommended ? "#0f766e" : isPopular ? "#1f2937" : "#f3f4f6", color: isPopular || isRecommended ? "white" : "#111827", fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1 }}>
        {isLoading ? "Please wait..." : ctaText}
      </button>
    </div>
  );
}

export function PricingSection() {
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendation() {
      try {
        const res = await fetch("/api/billing/recommendation");
        if (res.ok) {
          const data = await res.json();
          if (data.recommendation) {
            setRecommendedPlan(data.recommendation.recommendedPlan);
          }
        }
      } catch {
        setRecommendedPlan(null);
      }
    }
    fetchRecommendation();
  }, []);

  async function handleCheckout(tierId: "basic" | "standard" | "premium") {
    try {
      setLoadingTier(tierId);
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to continue");
      }

      window.location.href = data.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to continue");
      setLoadingTier(null);
    }
  }

  return (
    <section style={{ padding: "64px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Subscription Options</p>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#111827", marginBottom: 16 }}>Choose the right plan for your clinic</h2>
          <p style={{ fontSize: 18, color: "#4b5563", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>Select the level of access and support that fits your clinic's current needs.</p>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          <PricingTier name="Basic" price={2490} description="Essential access for clinics getting started with MediVault." isRecommended={recommendedPlan === "basic"} isLoading={loadingTier === "basic"} onSelect={() => handleCheckout("basic")} features={["Patient profiles", "Core platform access", "Standard record access", "Standard security", "Email support"]} />
          <PricingTier name="Standard" price={4750} isPopular={recommendedPlan !== "standard"} isRecommended={recommendedPlan === "standard"} isLoading={loadingTier === "standard"} onSelect={() => handleCheckout("standard")} description="A balanced plan for routine clinic operations." features={["Everything in Basic", "Secure record storage", "Improved search and access", "Clinic insights", "Priority support"]} />
          <PricingTier name="Premium" price={6700} isRecommended={recommendedPlan === "premium"} isLoading={loadingTier === "premium"} onSelect={() => handleCheckout("premium")} description="Advanced capabilities for larger or more active clinics." features={["Everything in Standard", "Advanced assistance tools", "Enhanced document handling", "Broader operational insight", "Priority service"]} />
        </div>
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Need a tailored clinic-wide arrangement? Contact the NextWave team for assistance.</p>
        </div>
      </div>
    </section>
  );
}
