import { Hero } from "../components/sections/Hero";
import { Services } from "../features/services";
import { Lookbook } from "../components/sections/Lookbook";
import { MapTeaser } from "../features/map";
import { Testimonials } from "../features/testimonials";
import { ClosingCta } from "../components/sections/ClosingCta";

import { SEO } from "../components/common/SEO";
import { generateLocalBusinessSchema } from "../lib/siteConfig";

export function HomePage() {
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      <SEO
        title="Trang Trí & Thiết Kế Tiệc Cưới, Sự Kiện Trọn Gói"
        canonical="/"
        jsonLd={localBusinessSchema}
      />
      <Hero />
      <Services />
      <Lookbook />
      <MapTeaser />
      <Testimonials />
      <ClosingCta />
    </>
  );
}
