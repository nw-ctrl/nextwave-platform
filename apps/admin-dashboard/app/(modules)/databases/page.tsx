export default function Page() {
  const capabilities = [
    "Tenant-specific database connection profiles",
    "Adapter support: supabase, postgres, firebase, mongodb, redis",
    "Secret-ref aware connection materialization",
    "On-demand connection health checks by profile ID"
  ];

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Database Router Control Center</h1>
      <p>Route each client or project to its own backend adapter and validate connectivity from one control plane.</p>
      <h2>Capabilities</h2>
      <ul>
        {capabilities.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>APIs</h2>
      <ul>
        <li>GET/POST `/api/databases/connections`</li>
        <li>POST `/api/databases/test`</li>
      </ul>
    </main>
  );
}
