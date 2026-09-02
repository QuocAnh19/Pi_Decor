import { useEffect, useState } from "react";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { categoryPortfolio } from "../../lib/content";
import { Container, Section, SectionHeader } from "../ui/Layout";
import { MediaSlot } from "../ui/MediaSlot";
import { Reveal } from "../ui/Reveal";
import { ProjectAlbumModal } from "../../features/projects";
import { api } from "../../lib/api";
import type { Project, CategoryPortfolioItem } from "../../lib/types";
import styles from "./Lookbook.module.scss";

export function Lookbook() {
  const [projects, setProjects] = useState<CategoryPortfolioItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<CategoryPortfolioItem | null>(null);
  const [tierFilter, setTierFilter] = useState<"all" | "premium" | "standard">("all");

  useEffect(() => {
    api
      .getProjects()
      .then((data: Project[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const publishedOnly = data.filter((p) => p.published !== false);
          const mapped: CategoryPortfolioItem[] = publishedOnly.map((p) => {
            const tags = Array.isArray(p.style_tags) ? p.style_tags : [];
            const matchingStatic = categoryPortfolio.find(
              (c) => c.id === p.id || c.title === p.title
            );
            return {
              id: p.id,
              categoryId: p.category_id || matchingStatic?.categoryId || "piwedding",
              tag: p.tag || (tags[1] ?? tags[0] ?? matchingStatic?.tag ?? "Gia Tiên"),
              title: p.title,
              location: p.location ?? matchingStatic?.location ?? "Đà Nẵng",
              src: p.cover_image ?? matchingStatic?.src ?? categoryPortfolio[0].src,
              gallery:
                Array.isArray(p.gallery) && p.gallery.length > 0
                  ? p.gallery
                  : matchingStatic?.gallery ?? [],
              priceTier: (p.price_tier as "standard" | "premium") || matchingStatic?.priceTier || "standard",
              featured: p.status === "featured" || Boolean(matchingStatic?.featured),
              status: p.status || matchingStatic?.status || "active",
            };
          });

          // Merge static lookbook projects not yet in database
          const merged = [...mapped];
          categoryPortfolio.forEach((staticItem) => {
            if (!merged.some((m) => m.id === staticItem.id || m.title === staticItem.title)) {
              merged.push({
                ...staticItem,
                priceTier: staticItem.priceTier || "standard",
                featured: Boolean(staticItem.featured),
                status: staticItem.status || "active",
              });
            }
          });
          setProjects(merged);
        } else {
          setProjects(categoryPortfolio);
        }
      })
      .catch(() => {
        setProjects(categoryPortfolio);
      });
  }, []);

  const sourceList = projects.length > 0 ? projects : categoryPortfolio;

  // Stable sort: featured projects appear first
  const sortedList = [...sourceList].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  // Filter by price tier
  const filteredList = sortedList.filter((item) => {
    if (tierFilter === "all") return true;
    return (item.priceTier || "standard") === tierFilter;
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

          {/* Price Tier Filter Tabs */}
          <div className={styles.filterRow}>
            {[
              { id: "all", label: "Tất cả" },
              { id: "premium", label: "Cao cấp" },
              { id: "standard", label: "Bình thường" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTierFilter(tab.id as "all" | "premium" | "standard")}
                className={`${styles.filterButton} ${tierFilter === tab.id ? styles.filterActive : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

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
                      <span className={styles.featuredBadge}>★ Nổi bật</span>
                    )}
                    {item.priceTier === "premium" && (
                      <span className={styles.premiumBadge}>✦ Cao cấp</span>
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
