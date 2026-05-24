import { Nav } from '@/components/marketing/nav';
import { Hero } from '@/components/marketing/hero';
import { TrustBar } from '@/components/marketing/trust-bar';
import { Problem } from '@/components/marketing/problem';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { Features } from '@/components/marketing/features';
import { LiveMap } from '@/components/marketing/live-map';
import { Reviews } from '@/components/marketing/reviews';
import { Pricing } from '@/components/marketing/pricing';
import { Footer } from '@/components/marketing/footer';
import { Marquee } from '@/components/marketing/marquee';
import { CtaSection } from '@/components/marketing/cta-section';

export default function HomePage() {
  return (
    <>
      <Nav />
      <Hero />
      <Marquee />
      <TrustBar />
      <Problem />
      <HowItWorks />
      <Features />
      <LiveMap />
      <Reviews />
      <Pricing />
      <CtaSection />
      <Footer />
    </>
  );
}
