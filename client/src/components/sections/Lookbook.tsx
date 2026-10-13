import { useEffect, useState, useCallback } from "react";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { Container, Section, SectionHeader } from "../ui/Layout";
import { MediaSlot } from "../ui/MediaSlot";
import { Reveal } from "../ui/Reveal";
import { ProjectAlbumModal } from "../../features/projects";
import { api } from "../../lib/api";
import type { Project, CategoryPortfolioItem } from "../../lib/types";
import styles from "./Lookbook.module.scss";

function resolveCover(cover: string | null, gallery: (string | { url: string; span?: string })[] | undefined): string {
  if (cover) return cover;
  if (Array.isArray(gallery) && gallery.length > 0) {
    const first = gallery[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "url" in first) return first.url;
  }
  return "/images/portfolio/piwedding-gia-tien-1.jpg";
}

type LookbookFilter = "all" | "featured" | "premium" | "standard";

export function Lookbook() {
  const [projects, setProjects] = useState<CategoryPortfolioItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<CategoryPortfolioItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<LookbookFilter>("all");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: Project[] = await api.getProjects();
      const mapped: CategoryPortfolioItem[] = data.map((p) => {
        const tags = Array.isArray(p.style_tags) ? p.style_tags : [];
        return {
          id: p.id,
          categoryId: p.category_id || tags[0] || "piwedding",
          tag: p.tag || tags[1] || tags[0] || "Gia Tiên",
          title: p.title,
          location: p.location || "Đà Nẵng",
          src: resolveCover(p.cover_image, p.gallery),
          gallery: Array.isArray(p.gallery) ? p.gallery : [],
          priceTier: (p.price_tier as "standard" | "premium") || "standard",
          featured: p.status === "featured",
          status: p.status || "active",
        };
      });

      setProjects(mapped);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể kết nối máy chủ để tải danh mục lookbook.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Sorting hierarchy:
  // 1. featured & premium (score: 3 - Dự án nổi bật cao cấp đứng đầu)
  // 2. featured & standard (score: 2 - Dự án nổi bật)
  // 3. premium & non-featured (score: 1 - Dự án cao cấp)
  // 4. standard & non-featured (score: 0 - Dự án bình thường)
  const sortedList = [...projects].sort((a, b) => {
    const aScore = (a.featured ? 2 : 0) + (a.priceTier === "premium" ? 1 : 0);
    const bScore = (b.featured ? 2 : 0) + (b.priceTier === "premium" ? 1 : 0);
    return bScore - aScore;
  });

  // Filter by category/tier/featured
  const filteredList = sortedList.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "featured") return Boolean(item.featured);
    if (activeFilter === "premium") return item.priceTier === "premium";
    if (activeFilter === "standard") return (item.priceTier || "standard") === "standard";
    return true;
  });

  const displayList = filteredList.slice(0, 9);

  return (
    <>
      <Section id="lookbook" tone="dim">
        <Container>
          <SectionHeader
            eyebrow="Lookbook Mới Nhất"
            title="Những concept đã thành hình"
            description="Các dự án trang trí vừa được Pi Decor triển khai thực tế gần đây nhất — nhấp vào ảnh để xem toàn bộ album thực tế."
            align="left"
          />

          {/* Filter Tabs */}
          <div className={styles.filterRow}>
            {[
              { id: "all", label: "Tất cả" },
              { id: "featured", label: "Nổi bật" },
              { id: "premium", label: "Cao cấp" },
              { id: "standard", label: "Bình thường" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as LookbookFilter)}
                className={`${styles.filterButton} ${activeFilter === tab.id ? styles.filterActive : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.grid} aria-busy="true" aria-label="Đang tải danh sách concept">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className={styles.skeletonCard} />
              ))}
            </div>
          ) : error ? (
            <div className={styles.errorBox} role="alert">
              <p className={styles.errorMessage}>{error}</p>
              <button type="button" onClick={loadProjects} className={styles.retryBtn}>
                Thử lại
              </button>
            </div>
          ) : displayList.length === 0 ? (
            <div className={styles.emptyBox}>
              <p>Chưa có dự án nào trong mục được chọn.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {displayList.map((item, i) => (
                <Reveal key={item.id} delay={i * 80}>
                  <div
                    className={styles.card}
                    onClick={() => setSelectedProject(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedProject(item);
                      }
                    }}
                    title={`Xem album: ${item.title || item.tag}`}
                  >
                    <MediaSlot
                      src={item.src}
                      alt={item.title || item.tag}
                      label={`Ảnh: ${item.tag}`}
                      hint={`public${item.src ?? ""} · 16:10`}
                      className={styles.media}
                      mediaClassName={styles.photo}
                    />
                    <div className={styles.overlay} />

                    {/* Badges */}
                    <div className={styles.badgeTopRow}>
                      {item.featured && (
                        <span className={styles.featuredBadge}>Nổi bật</span>
                      )}
                      {item.priceTier === "premium" && (
                        <span className={styles.premiumBadge}>Cao cấp</span>
                      )}
                    </div>

                    <div className={styles.expandOverlay}>
                      <ArrowsPointingOutIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                      <span>Xem album</span>
                    </div>

                    <div className={styles.contentOverlay}>
                      <p className={styles.tag}>
                        #PiDecor_{String(item.tag ?? "Concept").replace(/\s+/g, "")}
                      </p>
                      {item.title && <p className={styles.cardTitle}>{item.title}</p>}
                      {item.location && <p className={styles.location}>{item.location}</p>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {selectedProject && (
        <ProjectAlbumModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
