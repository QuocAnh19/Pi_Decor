import { useState, useEffect } from "react";
import { serviceCategories, categoryPortfolio } from "../../../lib/content";
import type { CategoryPortfolioItem, ServiceCategory } from "../../../lib/types";
import { api } from "../../../lib/api";
import { Container, Section, SectionHeader } from "../../../components/ui/Layout";
import { Reveal } from "../../../components/ui/Reveal";
import { ServiceCategoryCard } from "./ServiceCategoryCard";
import { ServiceDetailModal } from "./ServiceDetailModal";
import styles from "./ServicesSection.module.scss";

export function ServicesSection() {
  const featured = serviceCategories.find((c) => c.featured);
  const rest = serviceCategories.filter((c) => !c.featured);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | null>(null);
  const [portfolio, setPortfolio] = useState<CategoryPortfolioItem[]>(categoryPortfolio);

  useEffect(() => {
    async function loadDbProjects() {
      try {
        const rawProjects = await api.getProjects();
        if (Array.isArray(rawProjects) && rawProjects.length > 0) {
          const dbItems: CategoryPortfolioItem[] = rawProjects.map((p) => {
            const styleTags = Array.isArray(p.style_tags) ? p.style_tags : [];
            return {
              id: String(p.id),
              categoryId: p.category_id || styleTags[0] || "piwedding",
              tag: p.tag || styleTags[1] || "Gia Tiên",
              title: p.title || "Dự án mới",
              location: p.location || "Đà Nẵng",
              src: p.cover_image || p.src || "/images/portfolio/piwedding-gia-tien-1.jpg",
              gallery: Array.isArray(p.gallery) ? p.gallery : [],
            };
          });

          const merged = [...dbItems];
          categoryPortfolio.forEach((staticItem) => {
            if (!merged.some((m) => m.id === staticItem.id || m.title === staticItem.title)) {
              merged.push(staticItem);
            }
          });
          setPortfolio(merged);
        }
      } catch (err) {
        console.error("Could not fetch DB projects for services modal:", err);
      }
    }
    loadDbProjects();
  }, []);

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
        portfolio={portfolio}
        onClose={() => setActiveCategory(null)}
      />
    </Section>
  );
}
