import { marketingContent } from "../lib/marketing-content";

export function PlatformSection() {
  return (
    <section className="section">
      <h2>Enterprise Foundation</h2>
      <p className="section-intro">
        Architecture built for scale, localization, and product confidence across industries.
      </p>
      <div className="grid">
        {marketingContent.platformPillars.map((pillar) => (
          <article key={pillar.title} className="card">
            <h3>{pillar.title}</h3>
            <p>{pillar.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}