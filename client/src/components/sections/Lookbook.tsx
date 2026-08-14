import { useEffect, useState } from "react";
import { categoryPortfolio } from "../../lib/content";
import { Container, Section, SectionHeader } from "../ui/Layout";
import { MediaSlot } from "../ui/MediaSlot";
import { Reveal } from "../ui/Reveal";
import { api } from "../../lib/api";
import type { Project, CategoryPortfolioItem } from "../../lib/types";
import styles from "./Lookbook.module.scss";

export function Lookbook() {
  const [projects, setProjects] = useState<CategoryPortfolioItem[]>([]);

  useEffect(() => {
    api
      .getProjects()
      .then((data: Project[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const publishedOnly = data.filter((p) => p.published !== false);
          const mapped: CategoryPortfolioItem[] = publishedOnly.map((p) => {
            const tags = Array.isArray(p.style_tags) ? p.style_tags : [];
            return {
              id: p.id,
              categoryId: "piwedding",
              tag: tags[1] ?? tags[0] ?? "GiaTiên",
              title: p.title,
              location: p.location ?? "Đà Nẵng",
              src: p.cover_image ?? categoryPortfolio[0].src,
            };
          });
          setProjects(mapped);
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
    <Section id="lookbook" tone="dim">
      <Container>
        <SectionHeader
          eyebrow="Lookbook Mới Nhất"
          title="Những concept đã thành hình"
          description="Các dự án trang trí vừa được triển khai thực tế gần đây nhất."
          align="left"
        />
        <div className={styles.grid}>
          {displayList.slice(0, 9).map((item, i) => (
            <Reveal key={item.id} delay={i * 80}>
              <div className={styles.card}>
                <MediaSlot
                  src={item.src}
                  alt={item.title || item.tag}
                  label={`Ảnh: ${item.tag}`}
                  hint={`public${item.src ?? ""} · 16:10`}
                  className={styles.media}
                  mediaClassName={styles.photo}
                />
                <div className={styles.overlay} />
                <div className={styles.contentOverlay}>
                  <p className={styles.tag}>#PiDecor_{String(item.tag ?? "Concept").replace(/\s+/g, "")}</p>
                  {item.title && <p className={styles.cardTitle}>{item.title}</p>}
                  {item.location && <p className={styles.location}>{item.location}</p>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
