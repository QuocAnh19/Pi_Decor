import { Hero } from "../components/sections/Hero";
import { Services } from "../features/services";
import { Lookbook } from "../components/sections/Lookbook";
import { MapTeaser } from "../features/map";
import { Testimonials } from "../features/testimonials";
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
