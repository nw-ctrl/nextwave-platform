import { FinalCta } from "../components/final-cta";
import { GlobalSection } from "../components/global-section";
import { Header } from "../components/header";
import { Hero } from "../components/hero";
import { IndustrySection } from "../components/industry-section";
import { PlatformSection } from "../components/platform-section";

export default function Home() {
  return (
    <main className="page">
      <Header />
      <Hero />
      <PlatformSection />
      <IndustrySection />
      <GlobalSection />
      <FinalCta />
      <p className="footer">NextWave Platform for MediVault and enterprise product delivery.</p>
    </main>
  );
}