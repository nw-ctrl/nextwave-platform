export default function Page() {
  const endpoints = [
    "GET/POST /api/access/platform-roles",
    "GET/POST /api/access/memberships",
    "GET /api/access/effective?userId=..."
  ];

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Platform Access Documentation</h1>
      <p>Role model supports platform superuser/admin and tenant-scoped admin/manager/staff/viewer access.</p>
      <h2>Access APIs</h2>
      <ul>
        {endpoints.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </main>
  );
}
