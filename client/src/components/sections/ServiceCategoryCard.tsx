import * as Icons from "lucide-react";
import type { ServiceCategory } from "../../lib/types";
import { MediaSlot } from "../ui/MediaSlot";
import styles from "./ServiceCategoryCard.module.scss";

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
 * Full-bleed photo card, one per Pi Decor product line: real (or
 * placeholder-until-shot) cover photo behind a warm gradient scrim, brand
 * badge + icon floating top-left, title/description sitting on the scrim.
 * The whole card is a button — clicking it opens ServiceDetailModal, which
 * shows completed projects for this line grouped by sub-service.
 */
export function ServiceCategoryCard({
  category,
  onOpen,
}: {
  category: ServiceCategory;
  onOpen: (category: ServiceCategory) => void;
}) {
  const Icon = resolveIcon(category.icon);
  const cardClass = `${styles.card} ${accentClass[category.accent]} ${
    category.featured ? styles.featured : ""
  }`;

  return (
    <article className={cardClass}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => onOpen(category)}
        aria-haspopup="dialog"
      >
        <span className={styles.mediaWrap}>
          <MediaSlot
            src={category.cover}
            alt={category.title}
            label={`Ảnh ${category.brand}`}
            className={styles.media}
            mediaClassName={styles.mediaImg}
          />
          <span className={styles.scrim} aria-hidden="true" />
        </span>

        <span className={styles.badge}>
          <span className={styles.iconTile}>
            <Icon size={18} strokeWidth={1.75} />
          </span>
          <span className={styles.brand}>{category.brand}</span>
        </span>

        <span className={styles.content}>
          <span className={styles.tagline}>{category.tagline}</span>
          <span className={styles.title}>{category.title}</span>
          <span className={styles.description}>{category.description}</span>

          <span className={styles.chips}>
            {category.items.map((item) => (
              <span key={item} className={styles.chip}>
                {item}
              </span>
            ))}
          </span>

          <span className={styles.cta}>
            Xem dự án đã làm
            <Icons.ArrowUpRight size={16} className={styles.ctaIcon} />
          </span>
        </span>
      </button>
    </article>
  );
}
