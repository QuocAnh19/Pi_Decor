import { useState, useEffect, useCallback } from "react";
import type { CategoryPortfolioItem, ServiceCategory } from "../../../lib/types";
import { api } from "../../../lib/api";
import { toCategoryPortfolioItem } from "../../../lib/mappers";
import { Container, Section, SectionHeader } from "../../../components/ui/Layout";
import { Reveal } from "../../../components/ui/Reveal";
import { ServiceCategoryCard } from "./ServiceCategoryCard";
import { ServiceDetailModal } from "./ServiceDetailModal";
import styles from "./ServicesSection.module.scss";

import { useServicesQuery } from "../hooks/services.queries";

export function ServicesSection() {
  const servicesQuery = useServicesQuery();
  const [portfolio, setPortfolio] = useState<CategoryPortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState<boolean>(true);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | null>(null);

  const loadPortfolio = useCallback(async () => {
    setPortfolioLoading(true);
    setPortfolioError(null);
    try {
      const projectsRes = await api.getProjects();
      setPortfolio(projectsRes.map((p) => toCategoryPortfolioItem(p)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không thể kết nối máy chủ để tải dự án.";
      setPortfolioError(msg);
    } finally {
      setPortfolioLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const services = servicesQuery.data ?? [];
  const loading = servicesQuery.isLoading || portfolioLoading;
  const error = servicesQuery.isError
    ? "Không thể kết nối máy chủ để tải dịch vụ."
    : portfolioError;

  const loadData = () => {
    servicesQuery.refetch();
    loadPortfolio();
  };

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
            <div
              className={`${styles.featuredSlot} ${styles.skeletonCard} ${styles.skeletonFeatured}`}
            />
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
