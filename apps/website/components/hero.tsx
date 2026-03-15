import { Suspense } from "react";
import { CheckoutCta } from "./checkout-cta";
import { marketingContent } from "../lib/marketing-content";

export function Hero() {
  const [primaryAction, secondaryAction] = marketingContent.hero.actions;

  return (
    <section className="hero">
      <span className="tag">{marketingContent.hero.badge}</span>
      <h1>{marketingContent.hero.title}</h1>
      <p>{marketingContent.hero.subtitle}</p>
      <div className="hero-actions">
        <Suspense fallback={<button className="btn btn-primary" type="button">{primaryAction.label}</button>}>
          <CheckoutCta label={primaryAction.label} className="btn btn-primary" />
        </Suspense>
        {secondaryAction ? (
          <a className={`btn ${secondaryAction.variant === "primary" ? "btn-primary" : "btn-secondary"}`} href={secondaryAction.href}>
            {secondaryAction.label}
          </a>
        ) : null}
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
