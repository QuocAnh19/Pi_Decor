import { Hero } from "../components/sections/Hero";
import { Services } from "../components/sections/Services";
import { Lookbook } from "../components/sections/Lookbook";
import { MapTeaser } from "../components/sections/MapTeaser";
import { Testimonials } from "../components/sections/Testimonials";
import { ClosingCta } from "../components/sections/ClosingCta";

export function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Lookbook />
      <MapTeaser />
      <Testimonials />
      <ClosingCta />
    </>
  );
}
