import { PencilIcon, TrashIcon, PlusIcon, MapPinIcon } from "@heroicons/react/24/outline";
import type { Venue, VenueType } from "../../../lib/types";
import styles from "./VenueList.module.scss";

const typeLabel: Record<VenueType, string> = {
  hotel: "Khách sạn",
  restaurant: "Nhà hàng",
  resort: "Resort",
  "sảnh tiệc": "Sảnh tiệc",
};

interface VenueListProps {
  venues: Venue[];
  selectedId: string | null;
  onSelect: (venue: Venue) => void;
  onAdd: () => void;
  onEdit: (venue: Venue) => void;
  onDelete: (venue: Venue) => void;
}

export function VenueList({ venues, selectedId, onSelect, onAdd, onEdit, onDelete }: VenueListProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <p className={styles.heading}>Địa điểm ({venues.length})</p>
        <button type="button" className={styles.addButton} onClick={onAdd}>
          <PlusIcon className="h-4 w-4" style={{ width: 16, height: 16 }} /> Thêm venue
        </button>
      </div>

      {venues.length === 0 ? (
        <p className={styles.empty}>Chưa có địa điểm nào.</p>
      ) : (
        <ul className={styles.list}>
          {venues.map((venue) => (
            <li key={venue.id}>
              <div
                className={`${styles.item} ${selectedId === venue.id ? styles.itemActive : ""}`}
                onClick={() => onSelect(venue)}
              >
                <div className={styles.itemIcon}>
                  <MapPinIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                </div>
                <div className={styles.itemBody}>
                  <p className={styles.itemName}>{venue.name}</p>
                  <p className={styles.itemMeta}>
                    {typeLabel[venue.type]} · {venue.city ?? "—"} · {venue.project_count} dự án
                  </p>
                </div>
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(venue);
                    }}
                    aria-label="Sửa"
                  >
                    <PencilIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(venue);
                    }}
                    aria-label="Xoá"
                  >
                    <TrashIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
