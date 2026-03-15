"use client";

import React, { useEffect, useState } from "react";

interface PricingTierProps {
  name: string;
  price: number;
  earlyPrice?: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
  ctaText?: string;
  onSelect?: () => void;
  isLoading?: boolean;
}

function PricingTier({
  name,
  price,
  earlyPrice,
  description,
  features,
  isPopular,
  isRecommended,
  ctaText = "Get Started",
  onSelect,
  isLoading
}: PricingTierProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "32px 24px",
        borderRadius: 24,
        background: isPopular ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
        border: isRecommended ? "2px solid #059669" : (isPopular ? "2px solid #0f766e" : "1px solid #e5e7eb"),
        boxShadow: isPopular || isRecommended ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" : "none",
        position: "relative",
        transition: "transform 0.2s ease-in-out",
        minWidth: 300,
        transform: isRecommended ? "scale(1.02)" : "scale(1)"
      }}
    >
      {(isPopular || isRecommended) && (
        <div
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            background: isRecommended ? "#059669" : "#0f766e",
            color: "white",
            padding: "4px 16px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase"
          }}
        >
          {isRecommended ? "Recommended For You" : "Most Popular"}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: "#111827", fontWeight: 700 }}>{name}</h3>
        <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>{description}</p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>PKR</span>
          <span style={{ fontSize: 40, fontWeight: 800, color: "#111827" }}>
            {earlyPrice ? earlyPrice.toLocaleString() : price.toLocaleString()}
          </span>
          <span style={{ fontSize: 16, color: "#6b7280" }}>/mo</span>
        </div>
        {earlyPrice && (
          <p style={{ marginTop: 4, fontSize: 13, color: "#059669", fontWeight: 500 }}>
             Early Adopter Access (Regular: PKR {price.toLocaleString()})
          </p>
        )}
      </div>

      <ul style={{ padding: 0, margin: "0 0 32px 0", listStyle: "none", flex: 1, display: "grid", gap: 12 }}>
        {features.map((feature, i) => (
          <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "#4b5563" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0, color: i === 0 && feature.includes("Storage not included") ? "#ef4444" : (isRecommended ? "#059669" : "#0f766e") }}
            >
              <path
                d="M16.6667 5L7.50001 14.1667L3.33334 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ opacity: feature.includes("Storage not included") ? 0.6 : 1 }}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 12,
          border: "none",
          background: isRecommended ? "#059669" : (isPopular ? "#0f766e" : "#f3f4f6"),
          color: (isPopular || isRecommended) ? "white" : "#111827",
          fontWeight: 600,
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? "Loading..." : ctaText}
      </button>
    </div>
  );
}

export function PricingSection() {
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendation() {
      try {
        const res = await fetch("/api/billing/recommendation");
        if (res.ok) {
          const data = await res.json();
          if (data.recommendation) {
            setRecommendedPlan(data.recommendation.recommendedPlan);
            setReasons(data.recommendation.reasons);
          }
        }
      } catch (e) {
        console.error("Failed to fetch tier recommendation", e);
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
      if (!response.ok) throw new Error(data.error || "Checkout failed");

      // Redirect to Stripe Checkout session
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Failed to start checkout. Please try again.");
      setLoadingTier(null);
    }
  }

  return (
    <section style={{ padding: "64px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Founding Doctors Early Access
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#111827", marginBottom: 16 }}>
            Modern Infrastructure for Modern Clinics
          </h2>
          <p style={{ fontSize: 18, color: "#4b5563", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Doctors joining during the launch phase receive special introductory pricing locked for life.
          </p>

          {/* PROMO CODE HIGHLIGHT BOX */}
          <div style={{ marginTop: 24, display: "inline-block", background: "#fef3c7", border: "1px solid #f59e0b", padding: "12px 24px", borderRadius: 12, color: "#92400e", fontSize: 15, fontWeight: 600 }}>
            🎁 Use code <strong style={{ background: "white", padding: "2px 6px", borderRadius: 4, border: "1px solid #fcd34d" }}>DOC16</strong> at checkout to claim your 16% Founding Doctor discount!
          </div>

          {reasons.length > 0 && (
            <div style={{ marginTop: 24, display: "inline-block", background: "#ecfdf5", padding: "8px 16px", borderRadius: 8, color: "#065f46", fontSize: 14, fontWeight: 500 }}>
              💡 Based on your clinic's usage ({reasons.join(", ")}), we highlighted the best plan for you.
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          <PricingTier
            name="Basic"
            price={2490}
            description="For doctors who want simple access to the MediVault platform."
            isRecommended={recommendedPlan === "basic"}
            isLoading={loadingTier === "basic"}
            onSelect={() => handleCheckout("basic")}
            features={[
              "Patient profile management",
              "Access to platform tools",
              "Record viewing capability",
              "Standard data security",
              "Email support",
              "Storage not included"
            ]}
          />
          <PricingTier
            name="Standard"
            price={4750}
            earlyPrice={3990}
            isPopular={recommendedPlan !== "standard"} // Only show popular badge if it's not the recommended
            isRecommended={recommendedPlan === "standard"}
            isLoading={loadingTier === "standard"}
            onSelect={() => handleCheckout("standard")}
            description="Complete MediVault functionality for everyday clinical practice."
            features={[
              "Everything in Basic",
              "Secure patient record storage",
              "Advanced patient search",
              "Doctor dashboard insights",
              "Expanded capabilities",
              "Priority support"
            ]}
          />
          <PricingTier
            name="Premium"
            price={6700}
            earlyPrice={5490}
            isRecommended={recommendedPlan === "premium"}
            isLoading={loadingTier === "premium"}
            onSelect={() => handleCheckout("premium")}
            description="Advanced capabilities designed for busy practices and modern clinics."
            features={[
              "Everything in Standard",
              "AI medical assistance",
              "Smart document organization",
              "Predictive patient insights",
              "Higher storage capacity",
              "Priority VIP support"
            ]}
          />
        </div>

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            All plans include SSL encryption and are HIPAA-compliant by design. 
            <br />
            Need a custom clinic-wide setup? <a href="#" style={{ color: "#0f766e", fontWeight: 600, textDecoration: "none" }}>Contact Sales</a>
          </p>
        </div>
      </div>
    </section>
  );
}
