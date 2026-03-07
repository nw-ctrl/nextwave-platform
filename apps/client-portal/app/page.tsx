const modules = ["dashboard", "doctors", "templates", "billing", "usage", "settings"];

export default function ClinicPortalHome() {
  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Clinic Portal</h1>
      <ul>
        {modules.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </main>
  );
}