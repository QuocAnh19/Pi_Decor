import { useState, useEffect, useCallback } from "react";
import type { CategoryPortfolioItem, ServiceCategory } from "../../../lib/types";
import { api } from "../../../lib/api";
import { Container, Section, SectionHeader } from "../../../components/ui/Layout";
import { Reveal } from "../../../components/ui/Reveal";
import { ServiceCategoryCard } from "./ServiceCategoryCard";
import { ServiceDetailModal } from "./ServiceDetailModal";
import styles from "./ServicesSection.module.scss";

function resolveCover(cover: string | null, gallery: (string | { url: string; span?: string })[] | undefined): string {
  if (cover) return cover;
  if (Array.isArray(gallery) && gallery.length > 0) {
    const first = gallery[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "url" in first) return first.url;
  }
  return "/images/portfolio/piwedding-gia-tien-1.jpg";
}

export function ServicesSection() {
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [portfolio, setPortfolio] = useState<CategoryPortfolioItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [servicesRes, projectsRes] = await Promise.all([
        api.getServices(),
        api.getProjects(),
      ]);
      setServices(servicesRes);

      const mappedPortfolio: CategoryPortfolioItem[] = projectsRes.map((p) => {
        const styleTags = Array.isArray(p.style_tags) ? p.style_tags : [];
        return {
          id: String(p.id),
          categoryId: p.category_id || styleTags[0] || "piwedding",
          tag: p.tag || styleTags[1] || "Gia Tiên",
          title: p.title || "Dự án mới",
          location: p.location || "Đà Nẵng",
          src: resolveCover(p.cover_image, p.gallery),
          gallery: Array.isArray(p.gallery) ? p.gallery : [],
          priceTier: (p.price_tier as "standard" | "premium") || "standard",
          featured: p.status === "featured",
          status: p.status || "active",
        };
      });

      setPortfolio(mappedPortfolio);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể kết nối máy chủ để tải dịch vụ.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const featured = services.find((c) => c.featured) || services[0];
  const rest = services.filter((c) => c.id !== featured?.id);

  return (
    <Section id="services">
      <Container>
        <SectionHeader
          eyebrow="3 điều Pi Decor làm"
          title="Một studio, ba câu chuyện"
          description="PiKids cho những dấu mốc đầu đời, PiWedding cho ngày trọng đại, PiEvent cho dấu ấn thương hiệu — chạm vào từng thẻ để xem các dự án đã thực hiện."
        />

        {loading ? (
          <div className={styles.grid} aria-busy="true" aria-label="Đang tải dịch vụ">
            <div className={`${styles.featuredSlot} ${styles.skeletonCard} ${styles.skeletonFeatured}`} />
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        ) : error ? (
          <div className={styles.errorBox} role="alert">
            <p className={styles.errorMessage}>{error}</p>
            <button type="button" onClick={loadData} className={styles.retryBtn}>
              Thử lại
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className={styles.emptyBox}>
            <p>Hiện chưa có thông tin dịch vụ nào được công bố.</p>
          </div>
        ) : (
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
        )}
      </Container>

      <ServiceDetailModal
        category={activeCategory}
        portfolio={portfolio}
        onClose={() => setActiveCategory(null)}
      />
    </Section>
  );
}
