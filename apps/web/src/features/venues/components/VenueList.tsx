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
  allVenues: Venue[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedId: string | null;
  onSelect: (venue: Venue) => void;
  onAdd: () => void;
  onEdit: (venue: Venue) => void;
  onDelete: (venue: Venue) => void;
}

export function VenueList({
  venues,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: VenueListProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <p className={styles.heading}>
          <span>Danh sách địa điểm</span>
          <span className={styles.countBadge}>{venues.length}</span>
        </p>
        <button type="button" className={styles.addButton} onClick={onAdd}>
          <PlusIcon className="h-4 w-4" style={{ width: 14, height: 14 }} /> Thêm mới
        </button>
      </div>

      {venues.length === 0 ? (
        <p className={styles.empty}>Không tìm thấy địa điểm nào phù hợp bộ lọc.</p>
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
                    <span className={styles.typeBadge}>{typeLabel[venue.type] || venue.type}</span>
                    {venue.city ? ` · ${venue.city}` : ""}
                    <span> · {venue.project_count} dự án</span>
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
                    title="Sửa địa điểm"
                  >
                    <PencilIcon className="h-4 w-4" style={{ width: 14, height: 14 }} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(venue);
                    }}
                    title="Xóa địa điểm"
                  >
                    <TrashIcon className="h-4 w-4" style={{ width: 14, height: 14 }} />
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
