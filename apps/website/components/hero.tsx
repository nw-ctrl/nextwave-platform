import { marketingContent } from "../lib/marketing-content";

export function Hero() {
  return (
    <section className="hero">
      <span className="tag">{marketingContent.hero.badge}</span>
      <h1>{marketingContent.hero.title}</h1>
      <p>{marketingContent.hero.subtitle}</p>
      <div className="hero-actions">
        {marketingContent.hero.actions.map((action) => (
          <a
            key={action.label}
            className={`btn ${action.variant === "primary" ? "btn-primary" : "btn-secondary"}`}
            href={action.href}
          >
            {action.label}
          </a>
        ))}
      </div>
      <div className="status-strip">
        {marketingContent.trustMetrics.map((metric) => (
          <article key={metric.label} className="metric">
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}