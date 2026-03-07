export default function Page() {
  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Secrets Registry</h1>
      <p>Use `POST /api/secrets` to store and `GET /api/secrets` to list metadata.</p>
    </main>
  );
}