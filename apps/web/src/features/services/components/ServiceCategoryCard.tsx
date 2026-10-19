import * as Icons from "@heroicons/react/24/outline";
import type { ServiceCategory } from "../../../lib/types";
import { resolveIcon } from "../../../lib/icons";
import { cloudinaryUrl } from "../../../lib/cloudinary";
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

  const isCloudinary = Boolean(category.cover?.includes("res.cloudinary.com"));
  const coverSrc = isCloudinary
    ? cloudinaryUrl(category.cover, { width: 800 })
    : category.cover
      ? category.cover.replace(/\.(png|jpe?g)$/i, ".webp")
      : null;

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
            src={coverSrc}
            srcSet={
              !isCloudinary && category.cover
                ? `${category.cover.replace(/(\.png|\.webp|\.jpe?g)$/i, "-800w.webp")} 800w, ${category.cover.replace(/\.(png|jpe?g)$/i, ".webp")} 1200w`
                : undefined
            }
            sizes="(max-width: 768px) 100vw, 33vw"
            width={800}
            height={600}
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
            <Icons.ArrowUpRightIcon
              className={`h-4 w-4 ${styles.ctaIcon}`}
              style={{ width: 16, height: 16 }}
            />
          </span>
        </span>
      </button>
    </article>
  );
}
