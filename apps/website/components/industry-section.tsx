import { marketingContent } from "../lib/marketing-content";

export function IndustrySection() {
  return (
    <section className="section">
      <h2>Cross-Industry Delivery</h2>
      <p className="section-intro">
        One platform, many business contexts, each with tenant-level product identity.
      </p>
      <div className="grid">
        {marketingContent.industries.map((industry) => (
          <article key={industry.name} className="card">
            <h3>{industry.name}</h3>
            <p>{industry.fit}</p>
          </article>
        ))}
      </div>
    </section>
  );
}