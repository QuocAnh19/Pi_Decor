import { useMemo } from "react";
import { categoryPortfolio } from "../../lib/content";
import { Container, Section, SectionHeader } from "../ui/Layout";
import { MediaSlot } from "../ui/MediaSlot";
import { Reveal } from "../ui/Reveal";
import styles from "./Lookbook.module.scss";

const STORAGE_KEY = "pidecor_admin_projects";

export function Lookbook() {
  // Retrieve projects sorted by time descending (newest first)
  const recentProjects = useMemo(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out draft items
          const activeOnly = parsed.filter((p: any) => p.status !== "draft");
          // Sort newest timestamp / date first
          return activeOnly.sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        }
      }
    } catch (e) {
      console.warn("Failed to load admin projects for Lookbook:", e);
    }

    // Fallback seed portfolio sorted by time descending
    const fallbackList = categoryPortfolio.map((item, idx) => ({
      id: item.id,
      tag: item.tag,
      title: item.title,
      location: item.location,
      src: item.src,
      createdAt: Date.now() - idx * 86400000,
    }));

    return fallbackList.sort((a, b) => b.createdAt - a.createdAt);
  }, []);

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
          {recentProjects.slice(0, 9).map((item, i) => (
            <Reveal key={item.id} delay={i * 80}>
              <div className={styles.card}>
                <MediaSlot
                  src={item.src}
                  alt={item.title || item.tag}
                  label={`Ảnh: ${item.tag}`}
                  hint={`public${item.src ?? ""} · 4:5`}
                  className={styles.media}
                  mediaClassName={styles.photo}
                />
                <div className={styles.overlay} />
                <div className={styles.contentOverlay}>
                  <p className={styles.tag}>#PiDecor_{item.tag.replace(/\s+/g, "")}</p>
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
