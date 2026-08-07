import { Link } from "react-router-dom";
import { ImagePlus, ArrowRight } from "lucide-react";
import type { VenueDetail } from "../../lib/types";
import styles from "./VenuePopupCard.module.scss";

interface VenuePopupCardProps {
  venue: VenueDetail | null;
  loading: boolean;
}

const MAX_PROJECTS_SHOWN = 3;

/**
 * Small, marker-anchored version of the venue payoff moment (Mục 3 of the
 * mapping spec) — a quick taste of real past projects right where you
 * clicked, not a full page. "Xem thêm" lives on /ban-do for anyone who
 * wants the whole list.
 */
export function VenuePopupCard({ venue, loading }: VenuePopupCardProps) {
  if (loading || !venue) {
    return (
      <div className={styles.card}>
        <p className={styles.loading}>Đang tải dự án…</p>
      </div>
    );
  }

  const shown = venue.projects.slice(0, MAX_PROJECTS_SHOWN);
  const extra = venue.projects.length - shown.length;

  return (
    <div className={styles.card}>
      <p className={styles.name}>{venue.name}</p>
      {venue.address && (
        <p className={styles.address}>
          {venue.address}
          {venue.city ? `, ${venue.city}` : ""}
        </p>
      )}

      {shown.length === 0 ? (
        <p className={styles.empty}>
          Chưa có dự án công khai tại đây — để lại thông tin, đội mình tư vấn concept riêng cho bạn.
        </p>
      ) : (
        <ul className={styles.list}>
          {shown.map((project) => (
            <li key={project.id} className={styles.item}>
              <div className={styles.thumb}>
                {project.cover_image ? (
                  <img src={project.cover_image} alt={project.title} className={styles.thumbImg} />
                ) : (
                  <ImagePlus size={16} strokeWidth={1.5} className={styles.thumbIcon} />
                )}
              </div>
              <div className={styles.itemBody}>
                <p className={styles.itemTitle}>{project.title}</p>
                {project.style_tags.length > 0 && (
                  <p className={styles.itemTags}>{project.style_tags.map((t) => `#${t}`).join(" ")}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {extra > 0 && <p className={styles.more}>+{extra} dự án khác tại địa điểm này</p>}

      <Link to="/studio" className={styles.cta}>
        Thử phối màu tương tự <ArrowRight size={13} />
      </Link>
    </div>
  );
}
