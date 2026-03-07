export function HeroPanel(props: { title: string; subtitle: string }) {
  return (
    <section style={{ border: "1px solid #d5d5d5", borderRadius: 8, padding: 16, marginTop: 16 }}>
      <h2>{props.title}</h2>
      <p>{props.subtitle}</p>
    </section>
  );
}