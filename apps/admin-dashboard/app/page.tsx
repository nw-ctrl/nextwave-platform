const modules = [
  "projects",
  "clients",
  "repositories",
  "databases",
  "billing",
  "monitoring",
  "analytics",
  "documentation",
  "secrets",
  "labs"
];

export default function AdminDashboardHome() {
  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Admin Dashboard</h1>
      <ul>
        {modules.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </main>
  );
}