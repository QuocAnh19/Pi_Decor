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
            };
          });

          // Merge static lookbook projects not yet in database
          const merged = [...mapped];
          categoryPortfolio.forEach((staticItem) => {
            if (!merged.some((m) => m.id === staticItem.id || m.title === staticItem.title)) {
              merged.push(staticItem);
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

  const displayList = projects.length > 0 ? projects : categoryPortfolio;

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
          <div className={styles.grid}>
            {displayList.slice(0, 9).map((item, i) => (
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
