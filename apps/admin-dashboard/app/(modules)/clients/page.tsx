export default function Page() {
  const capabilities = [
    "Tenant branding profiles per app (web/mobile/vertical)",
    "Feature flags and rollout controls per tenant",
    "Bootstrap endpoint for white-label app initialization"
  ];

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Client Experience Control Center</h1>
      <p>Manage tenant identity and feature delivery for healthcare, automotive, and future industry apps.</p>
      <h2>Capabilities</h2>
      <ul>
        {capabilities.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>APIs</h2>
      <ul>
        <li>GET/POST `/api/clients/branding`</li>
        <li>GET/POST `/api/clients/features`</li>
        <li>GET `/api/tenant/bootstrap?clientId=...&appId=...`</li>
      </ul>
    </main>
  );
}
