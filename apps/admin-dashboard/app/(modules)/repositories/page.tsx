export default function Page() {
  const capabilities = [
    "Multiple GitHub connections per tenant/client",
    "Repository binding to clients and projects",
    "On-demand sync of metadata and default branch",
    "Token/App auth references per connection"
  ];

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Repository Control Center</h1>
      <p>Manage multiple GitHub orgs, repos, and client/project bindings from a single admin layer.</p>
      <h2>Capabilities</h2>
      <ul>
        {capabilities.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>APIs</h2>
      <ul>
        <li>GET/POST `/api/github/connections`</li>
        <li>GET/POST `/api/github/repositories`</li>
        <li>POST `/api/github/sync`</li>
      </ul>
    </main>
  );
}
