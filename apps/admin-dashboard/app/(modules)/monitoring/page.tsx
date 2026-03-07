export default function Page() {
  const probes = [
    { service: "API Gateway", status: "healthy", latencyMs: 48 },
    { service: "Supabase", status: "healthy", latencyMs: 62 },
    { service: "Webhook Worker", status: "degraded", latencyMs: 188 }
  ];

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Infrastructure Monitoring</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">Service</th>
            <th align="left">Status</th>
            <th align="left">Latency (ms)</th>
          </tr>
        </thead>
        <tbody>
          {probes.map((probe) => (
            <tr key={probe.service}>
              <td>{probe.service}</td>
              <td>{probe.status}</td>
              <td>{probe.latencyMs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}