export default function Page() {
  const cards = [
    { name: "Daily Active Clinics", value: "132" },
    { name: "API Requests", value: "1.2M" },
    { name: "Template Runs", value: "87k" }
  ];

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Analytics Dashboard</h1>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {cards.map((card) => (
          <section key={card.name} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>{card.name}</h3>
            <p style={{ fontSize: 24, margin: 0 }}>{card.value}</p>
          </section>
        ))}
      </div>
    </main>
  );
}