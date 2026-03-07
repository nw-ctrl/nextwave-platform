import { marketingContent } from "../lib/marketing-content";

export function GlobalSection() {
  return (
    <section className="section">
      <h2>Global Adaptation System</h2>
      <p className="section-intro">
        Country-aware rollout controls so every market feels locally crafted, not translated.
      </p>
      <div className="grid">
        {marketingContent.globalReadiness.map((item) => (
          <article key={item.title} className="card">
            <h3>{item.title}</h3>
            <ul>
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}