import { useState } from "react";
import { serviceCategories, categoryPortfolio } from "../../lib/content";
import type { ServiceCategory } from "../../lib/types";
import { Container, Section, SectionHeader } from "../ui/Layout";
import { Reveal } from "../ui/Reveal";
import { ServiceCategoryCard } from "./ServiceCategoryCard";
import { ServiceDetailModal } from "./ServiceDetailModal";
import styles from "./Services.module.scss";

/**
 * 3 real product lines, 3 accents, 1 bento grid — PiWedding (the flagship,
 * the only line wired to the Interactive Studio) takes the large slot;
 * PiKids and PiEvent flank it. See PiDecor_AdminPanel.md / the physical
 * business card for where these three names come from.
 *
 * Clicking any card opens ServiceDetailModal, which shows completed
 * projects for that line filtered by its own sub-services.
 */
export function Services() {
  const featured = serviceCategories.find((c) => c.featured);
  const rest = serviceCategories.filter((c) => !c.featured);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | null>(null);

  return (
    <Section id="services">
      <Container>
        <SectionHeader
          eyebrow="3 điều Pi Decor làm"
          title="Một studio, ba câu chuyện"
          description="PiKids cho những dấu mốc đầu đời, PiWedding cho ngày trọng đại, PiEvent cho dấu ấn thương hiệu — chạm vào từng thẻ để xem các dự án đã thực hiện."
        />
        <div className={styles.grid}>
          {featured && (
            <Reveal className={styles.featuredSlot}>
              <ServiceCategoryCard category={featured} onOpen={setActiveCategory} />
            </Reveal>
          )}
          {rest.map((category, i) => (
            <Reveal key={category.id} delay={(i + 1) * 90}>
              <ServiceCategoryCard category={category} onOpen={setActiveCategory} />
            </Reveal>
          ))}
        </div>
      </Container>

      <ServiceDetailModal
        category={activeCategory}
        portfolio={categoryPortfolio}
        onClose={() => setActiveCategory(null)}
      />
    </Section>
  );
}
