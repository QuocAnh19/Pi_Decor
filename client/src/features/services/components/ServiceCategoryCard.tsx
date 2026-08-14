import * as Icons from "@heroicons/react/24/outline";
import type { ServiceCategory } from "../../../lib/types";
import { resolveIcon } from "../../../lib/icons";
import { MediaSlot } from "../../../components/ui/MediaSlot";
import styles from "./ServiceCategoryCard.module.scss";

const accentClass = {
  kids: styles.kids,
  wedding: styles.wedding,
  event: styles.event,
};

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
            <Icon className="h-4 w-4" style={{ width: 16, height: 16 }} />
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
            <Icons.ArrowUpRightIcon className={`h-4 w-4 ${styles.ctaIcon}`} style={{ width: 16, height: 16 }} />
          </span>
        </span>
      </button>
    </article>
  );
}
