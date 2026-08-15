import { useEffect, useMemo, useState } from "react";
import * as Icons from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import type { CategoryPortfolioItem, ServiceCategory } from "../../../lib/types";
import { resolveIcon } from "../../../lib/icons";
import { MediaSlot } from "../../../components/ui/MediaSlot";
import { Modal } from "../../../components/ui";
import { ProjectAlbumModal } from "../../projects";
import styles from "./ServiceDetailModal.module.scss";

const accentClass = {
  kids: styles.kids,
  wedding: styles.wedding,
  event: styles.event,
};

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
  const [openProject, setOpenProject] = useState<CategoryPortfolioItem | null>(null);

  useEffect(() => {
    setActiveTag(null);
    setOpenProject(null);
  }, [category?.id]);

  const categoryItems = useMemo(() => {
    if (!category) return [];
    return portfolio.filter((item) => item.categoryId === category.id);
  }, [category, portfolio]);

  const filteredItems = useMemo(() => {
    if (!activeTag) return categoryItems;
    return categoryItems.filter((item) => item.tag === activeTag);
  }, [categoryItems, activeTag]);

  if (!category) return null;

  const Icon = resolveIcon(category.icon);
  const rootClass = `${accentClass[category.accent]}`;

  

  return (
    <>
      <Modal
        isOpen={Boolean(category)}
        onClose={onClose}
        maxWidth="880px"
        className={rootClass}
        bodyPadding={false}
      >
        <div className={styles.hero}>
          {category.cover ? (
            <img
              src={category.cover}
              alt={category.title}
              className={styles.heroImage}
            />
          ) : (
            <MediaSlot
              src={category.cover}
              alt={category.title}
              label={`Bìa ${category.brand}`}
              className={styles.heroMedia}
            />
          )}
          <span className={styles.heroScrim} aria-hidden="true" />
          <div className={styles.heroContent}>
            <span className={styles.badge}>
              <span className={styles.iconTile}>
                <Icon className="h-4 w-4" style={{ width: 16, height: 16 }} />
              </span>
              <span className={styles.brand}>{category.brand}</span>
            </span>
            <h2 className={styles.title}>{category.title}</h2>
            <p className={styles.tagline}>{category.tagline}</p>
          </div>
        </div>

        <div className={styles.body}>
          <p className={styles.description}>{category.description}</p>

          <div className={styles.filters} role="tablist" aria-label="Lọc theo dịch vụ">
            <button
              type="button"
              role="tab"
              aria-selected={activeTag === null}
              className={`${styles.filterChip} ${
                activeTag === null ? styles.filterChipActive : ""
              }`}
              onClick={() => setActiveTag(null)}
            >
              Tất cả ({categoryItems.length})
            </button>
            {category.items.map((item) => {
              const count = categoryItems.filter((i) => i.tag === item).length;
              const isActive = activeTag === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.filterChip} ${
                    isActive ? styles.filterChipActive : ""
                  }`}
                  onClick={() => setActiveTag(isActive ? null : item)}
                >
                  {item} ({count})
                </button>
              );
            })}
          </div>

          <p className={styles.resultCount}>
            Hiển thị {filteredItems.length} dự án đã thực hiện
          </p>

          <div className={styles.grid}>
            {filteredItems.map((project) => (
              <button
                key={project.id}
                type="button"
                className={styles.projectCard}
                onClick={() => setOpenProject(project)}
              >
                <span className={styles.projectMediaWrap}>
                  <MediaSlot
                    src={project.src}
                    alt={project.title}
                    label={project.title}
                    className={styles.projectMedia}
                  />
                  <span className={styles.expandOverlay} aria-hidden="true">
                    <Icons.ArrowsPointingOutIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                  </span>
                  <span className={styles.projectTag}>{project.tag}</span>
                </span>
                <span className={styles.projectTitle}>{project.title}</span>
                <span className={styles.projectLocation}>
                  {project.location ?? "Việt Nam"}
                </span>
              </button>
            ))}
          </div>

          <div className={styles.footer}>
            <Link
              to={`/tu-van?service=${category.id}`}
              className={styles.cta}
              onClick={onClose}
            >
              Tư vấn báo giá cho {category.brand}
              <Icons.ArrowRightIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </Modal>

      {openProject && (
        <ProjectAlbumModal
          project={openProject}
          onClose={() => setOpenProject(null)}
        />
      )}
    </>
  );
}
