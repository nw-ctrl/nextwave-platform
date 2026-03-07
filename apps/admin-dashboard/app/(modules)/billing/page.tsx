export default function Page() {
  const controls = [
    "Platform billing profiles for centralized subscriptions",
    "Client billing profiles with optional Stripe account mapping",
    "Subscription status checks by clientId or customerId",
    "Entitlement-ready schema for feature gating"
  ];

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Billing Control Center</h1>
      <p>Operate both NextWave platform billing and client-specific billing profiles from one control plane.</p>
      <h2>Capabilities</h2>
      <ul>
        {controls.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>APIs</h2>
      <ul>
        <li>GET/POST `/api/billing/profiles`</li>
        <li>GET `/api/subscription-status?clientId=...`</li>
        <li>POST `/api/stripe/webhook`</li>
      </ul>
    </main>
  );
}
