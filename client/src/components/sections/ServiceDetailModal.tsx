import { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { Link } from "react-router-dom";
import type { CategoryPortfolioItem, ServiceCategory } from "../../lib/types";
import { MediaSlot } from "../ui/MediaSlot";
import styles from "./ServiceDetailModal.module.scss";

function resolveIcon(name: string) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name];
  return Icon ?? Icons.Circle;
}

const accentClass = {
  kids: styles.kids,
  wedding: styles.wedding,
  event: styles.event,
};

/**
 * Detail modal opened from a ServiceCategoryCard. Shows the full pitch for
 * that product line plus "các dự án đã làm" (completed projects), filterable
 * by the category's own sub-services (e.g. PiKids → Đầy Tháng / Thôi Nôi /
 * Sinh Nhật / Party) — each project is tagged to exactly one of those.
 */
export function ServiceDetailModal({
  category,
  portfolio,
  onClose,
}: {
  category: ServiceCategory | null;
  portfolio: CategoryPortfolioItem[];
  onClose: () => void;
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Reset the filter every time a different category is opened.
  useEffect(() => {
    setActiveTag(null);
  }, [category?.id]);

  useEffect(() => {
    if (!category) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [category, onClose]);

  const items = useMemo(() => {
    if (!category) return [];
    const forCategory = portfolio.filter((p) => p.categoryId === category.id);
    if (!activeTag) return forCategory;
    return forCategory.filter((p) => p.tag === activeTag);
  }, [portfolio, category, activeTag]);

  if (!category) return null;

  const Icon = resolveIcon(category.icon);
  const rootClass = `${styles.overlay} ${accentClass[category.accent]}`;

  const cta = category.href ? (
    <Link to={category.href} className={styles.cta} onClick={onClose}>
      {category.ctaLabel}
      <Icons.ArrowRight size={16} />
    </Link>
  ) : (
    <a href="#contact" className={styles.cta} onClick={onClose}>
      {category.ctaLabel}
      <Icons.ArrowRight size={16} />
    </a>
  );

  return (
    <div className={rootClass} role="dialog" aria-modal="true" aria-label={category.title}>
      <button type="button" className={styles.backdrop} aria-label="Đóng" onClick={onClose} />

      <div className={styles.panel}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Đóng">
          <Icons.X size={18} />
        </button>

        <div className={styles.hero}>
          <MediaSlot
            src={category.cover}
            alt={category.title}
            label={`Ảnh ${category.brand}`}
            hint="1600×700 · ngang · JPG"
            className={styles.heroMedia}
          />
          <div className={styles.heroScrim} aria-hidden="true" />
          <div className={styles.heroContent}>
            <span className={styles.badge}>
              <span className={styles.iconTile}>
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <span className={styles.brand}>{category.brand}</span>
            </span>
            <h3 className={styles.title}>{category.title}</h3>
            <p className={styles.tagline}>{category.tagline}</p>
          </div>
        </div>

        <div className={styles.body}>
          <p className={styles.description}>{category.description}</p>

          <div className={styles.filters}>
            <button
              type="button"
              className={`${styles.filterChip} ${!activeTag ? styles.filterChipActive : ""}`}
              onClick={() => setActiveTag(null)}
            >
              Tất cả
            </button>
            {category.items.map((item) => (
              <button
                key={item}
                type="button"
                className={`${styles.filterChip} ${activeTag === item ? styles.filterChipActive : ""}`}
                onClick={() => setActiveTag(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <p className={styles.resultCount}>
            {items.length > 0
              ? `${items.length} dự án đã thực hiện${activeTag ? ` · ${activeTag}` : ""}`
              : "Đang cập nhật ảnh dự án cho hạng mục này"}
          </p>

          <div className={styles.grid}>
            {items.map((item) => (
              <div key={item.id} className={styles.projectCard}>
                <div className={styles.projectMediaWrap}>
                  <MediaSlot
                    src={item.src}
                    alt={item.title}
                    label={item.title}
                    hint="4:5 · JPG"
                    className={styles.projectMedia}
                  />
                  <span className={styles.projectTag}>{item.tag}</span>
                </div>
                <p className={styles.projectTitle}>{item.title}</p>
                {item.location && <p className={styles.projectLocation}>{item.location}</p>}
              </div>
            ))}
          </div>

          <div className={styles.footer}>{cta}</div>
        </div>
      </div>
    </div>
  );
}
