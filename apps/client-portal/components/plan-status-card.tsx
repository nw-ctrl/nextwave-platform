"use client";

import React from "react";

interface PlanStatusCardProps {
  planName: string;
  price: number;
  nextBillingDate: string;
  onManage?: () => void;
}

export function PlanStatusCard({
  planName = "Standard Plan",
  price = 3990,
  nextBillingDate = "12 April 2026",
  onManage
}: PlanStatusCardProps) {
  return (
    <div style={{ padding: 24, borderRadius: 24, background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08), 0 20px 25px -5px rgba(0,0,0,0.04)", maxWidth: 400 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Plan</p>
          <h2 style={{ margin: "4px 0 0 0", fontSize: 20, fontWeight: 800, color: "#111827" }}>{planName}</h2>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>PKR {price.toLocaleString()}</span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>/month</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 14, color: "#4b5563", lineHeight: 1.5 }}>Review your current subscription and billing preferences for this clinic.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          Renewal date: <strong>{nextBillingDate}</strong>
        </div>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        <button onClick={onManage} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "#111827", color: "white", fontWeight: 600, cursor: "pointer" }}>
          Manage Plan
        </button>
      </div>
    </div>
  );
}
