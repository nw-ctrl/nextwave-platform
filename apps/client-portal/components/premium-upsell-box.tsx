"use client";

import React from "react";

interface PremiumUpsellBoxProps {
  onUpgrade?: () => void;
}

export function PremiumUpsellBox({ onUpgrade }: PremiumUpsellBoxProps) {
  return (
    <div
      style={{
        padding: 32,
        borderRadius: 24,
        background: "linear-gradient(135deg, #111827 0%, #0f766e 100%)",
        color: "white",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 500,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative background circle */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          pointerEvents: "none"
        }}
      />

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(255, 255, 255, 0.2)", padding: "2px 10px", borderRadius: 999, textTransform: "uppercase" }}>
            Recommended
          </span>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Upgrade to Premium</h3>
        </div>
        <p style={{ margin: 0, fontSize: 16, opacity: 0.9, lineHeight: 1.6 }}>
          Unlock the full potential of your clinic with AI-powered assistance and predictive insights.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "grid", gap: 8 }}>
          {[
            "AI-powered records",
            "Smart organization",
            "Predictive insights",
          ].map((feature, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 14, opacity: 0.7, textDecoration: "line-through" }}>PKR 6,700/mo</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>PKR 5,490<span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8 }}>/mo</span></div>
          <div style={{ fontSize: 11, color: "#2dd4bf", fontWeight: 600 }}>Early Adopter Logic</div>
        </div>
      </div>

      <button
        onClick={onUpgrade}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: 14,
          border: "none",
          background: "white",
          color: "#0f766e",
          fontWeight: 700,
          fontSize: 16,
          cursor: "pointer",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.2s"
        }}
      >
        Upgrade Plan
      </button>
    </div>
  );
}
