import { marketingContent } from "../lib/marketing-content";

export function Header() {
  return (
    <header className="nav">
      <div className="logo">
        <span className="logo-mark">N</span>
        <span>NextWave Platform</span>
      </div>
      <nav className="nav-links">
        {marketingContent.nav.map((item) => (
          <a key={item} href="#">
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}