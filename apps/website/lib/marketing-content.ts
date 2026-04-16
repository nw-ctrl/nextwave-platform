export const marketingContent = {
  nav: ["Platform", "Industries", "Global", "Integrations", "Contact"],
  hero: {
    badge: "Built for regulated delivery and operational clarity",
    title: "Build enterprise platforms with market-ready control.",
    subtitle:
      "NextWave helps teams deliver healthcare and enterprise systems with tenant-aware controls, region-ready operations, and deployment-grade reliability.",
    actions: [
      { label: "Start Enterprise Build", href: "/contact", variant: "primary" as const },
      { label: "View Architecture", href: "/platform", variant: "secondary" as const }
    ]
  },
  trustMetrics: [
    { value: "Multi-region", label: "Country-aware delivery model" },
    { value: "Tenant-first", label: "Separate data, billing, and branding" },
    { value: "Human-ready", label: "Language and tone adaptation" },
    { value: "Audit-safe", label: "Compliance and observability hooks" }
  ],
  platformPillars: [
    {
      title: "Operational UX foundation",
      description:
        "Interface systems built around clarity, consistency, and task completion for regulated and operational environments."
    },
    {
      title: "Multi-GitHub delivery topology",
      description:
        "Connect multiple GitHub orgs and repos per client, with isolated pipelines and policy controls for enterprise delivery."
    },
    {
      title: "Flexible render runtime",
      description:
        "Support static, server-rendered, and hybrid deployment modes to match regulatory, performance, and cost needs by region."
    },
    {
      title: "Tenant billing orchestration",
      description:
        "Stripe-ready architecture for platform subscriptions plus client-specific plans, entitlements, and usage metering."
    }
  ],
  industries: [
    {
      name: "Healthcare and clinics",
      fit: "Clinical workflows, role-governed access, secure records, and operational reliability"
    },
    {
      name: "Professional services",
      fit: "Client portals, invoicing intelligence, contract-grade reporting"
    },
    {
      name: "Regulated operations",
      fit: "Audit trails, role boundaries, infrastructure observability"
    },
    {
      name: "High-growth SaaS",
      fit: "Rapid module launches with stable governance"
    }
  ],
  globalReadiness: [
    {
      title: "Country packs",
      points: ["Localized copy strategy", "Regional billing rules", "Policy and consent variants"]
    },
    {
      title: "Cultural tuning",
      points: ["Tone variants by market", "Industry-specific messaging", "Trust signal customization"]
    },
    {
      title: "Societal fit",
      points: ["Accessibility-first patterns", "Context-aware onboarding", "Brand layers by tenant"]
    }
  ]
};

export type ButtonVariant = (typeof marketingContent.hero.actions)[number]["variant"];
