import { useMemo } from "react";
import { PencilIcon, TrashIcon, PlusIcon, MapPinIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { SearchInput } from "../../../components/ui";
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
  allVenues,
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: VenueListProps) {
  const counts = useMemo(() => {
    return {
      all: allVenues.length,
      hotel: allVenues.filter((v) => v.type === "hotel").length,
      restaurant: allVenues.filter((v) => v.type === "restaurant").length,
      resort: allVenues.filter((v) => v.type === "resort").length,
      "sảnh tiệc": allVenues.filter((v) => v.type === "sảnh tiệc").length,
    };
  }, [allVenues]);

  const typeTabs = [
    { id: "all", label: `Tất cả (${counts.all})` },
    { id: "hotel", label: `Khách sạn (${counts.hotel})` },
    { id: "restaurant", label: `Nhà hàng (${counts.restaurant})` },
    { id: "resort", label: `Resort (${counts.resort})` },
    { id: "sảnh tiệc", label: `Sảnh tiệc (${counts["sảnh tiệc"]})` },
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <p className={styles.heading}>
          <BuildingOffice2Icon className="h-4 w-4 inline mr-1.5" style={{ width: 18, height: 18, color: "#a15c2e", display: "inline", marginRight: "6px" }} />
          Địa điểm ({venues.length})
        </p>
        <button type="button" className={styles.addButton} onClick={onAdd}>
          <PlusIcon className="h-4 w-4" style={{ width: 14, height: 14 }} /> Thêm venue
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <SearchInput
          placeholder="Tìm tên, địa chỉ, thành phố..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className={styles.tabsRow}>
        {typeTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTypeChange(tab.id)}
            className={`${styles.tabBtn} ${selectedType === tab.id ? styles.tabBtnActive : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {venues.length === 0 ? (
        <p className={styles.empty}>Không tìm thấy địa điểm nào phù hợp.</p>
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
                    <span className={styles.typeBadge}>{typeLabel[venue.type]}</span> · {venue.city ?? "—"} · {venue.project_count} dự án
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
