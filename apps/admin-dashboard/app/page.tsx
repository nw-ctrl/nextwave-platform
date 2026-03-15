import Link from 'next/link';

const modules = [
  { name: "projects", path: "/modules/projects" },
  { name: "clients", path: "/modules/clients" },
  { name: "repositories", path: "/modules/repositories" },
  { name: "databases", path: "/modules/databases" },
  { name: "billing", path: "/modules/billing" },
  { name: "monitoring", path: "/modules/monitoring" },
  { name: "analytics", path: "/modules/analytics" },
  { name: "documentation", path: "/modules/documentation" },
  { name: "secrets", path: "/modules/secrets" },
  { name: "labs", path: "/modules/labs" }
];

export default function AdminDashboardHome() {
  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Admin Dashboard</h1>
      <p style={{ color: "#4b5563", marginBottom: 24 }}>Select a module to manage platform infrastructure.</p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "300px" }}>
        {modules.map((item) => (
          <Link 
            key={item.name} 
            href={item.path}
            style={{
              padding: "12px 16px",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#111827",
              fontWeight: 500,
              textTransform: "capitalize",
              transition: "background 0.2s"
            }}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </main>
  );
}
