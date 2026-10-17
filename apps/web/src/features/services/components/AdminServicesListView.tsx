import {
  ChevronUpIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { AdminTable, AdminTableRow } from "../../../components/admin";
import { Badge } from "../../../components/ui";
import { resolveIcon } from "../../../lib/icons";
import type { ServiceCategory } from "../../../lib/types";
import styles from "./AdminServicesListView.module.scss";

interface AdminServicesListViewProps {
  services: ServiceCategory[];
  onEdit: (service: ServiceCategory) => void;
  onDelete: (service: ServiceCategory) => void;
  onToggleFeatured: (service: ServiceCategory) => void;
  onMoveOrder: (service: ServiceCategory, direction: "up" | "down") => void;
  updatingId?: string | null;
}

const TABLE_HEADERS = [
  { label: "Thứ tự", width: "110px" },
  { label: "Dịch vụ & Nhãn hiệu" },
  { label: "Tông màu", width: "120px" },
  { label: "Phân mục con", width: "130px" },
  { label: "Nổi bật", width: "120px", align: "center" as const },
  { label: "Thao tác", width: "100px", align: "right" as const },
];

export function AdminServicesListView({
  services,
  onEdit,
  onDelete,
  onToggleFeatured,
  onMoveOrder,
  updatingId,
}: AdminServicesListViewProps) {
  return (
    <AdminTable headers={TABLE_HEADERS}>
      {services.map((item, index) => {
        const IconComp = resolveIcon(item.icon);
        const isFirst = index === 0;
        const isLast = index === services.length - 1;
        const isUpdating = updatingId === item.id;

        return (
          <AdminTableRow key={item.id}>
            <td>
              <div className={styles.orderCell}>
                <span className={styles.orderBadge}>{item.order ?? 0}</span>
                <button
                  type="button"
                  className={styles.orderBtn}
                  onClick={() => onMoveOrder(item, "up")}
                  disabled={isFirst || isUpdating}
                  title="Di chuyển lên"
                  aria-label={`Di chuyển ${item.title} lên`}
                >
                  <ChevronUpIcon style={{ width: 12, height: 12 }} />
                </button>
                <button
                  type="button"
                  className={styles.orderBtn}
                  onClick={() => onMoveOrder(item, "down")}
                  disabled={isLast || isUpdating}
                  title="Di chuyển xuống"
                  aria-label={`Di chuyển ${item.title} xuống`}
                >
                  <ChevronDownIcon style={{ width: 12, height: 12 }} />
                </button>
              </div>
            </td>

            <td>
              <div className={styles.serviceMeta}>
                {item.cover ? (
                  <img src={item.cover} alt={item.title} className={styles.serviceThumb} />
                ) : (
                  <div className={styles.iconWrapper}>
                    <IconComp style={{ width: 20, height: 20 }} />
                  </div>
                )}
                <div className={styles.serviceInfo}>
                  <span className={styles.brandBadge}>{item.brand}</span>
                  <span className={styles.serviceTitle}>{item.title}</span>
                  {item.tagline && <span className={styles.serviceTagline}>{item.tagline}</span>}
                </div>
              </div>
            </td>

            <td>
              <Badge
                tone={
                  item.accent === "wedding" ? "accent" : item.accent === "kids" ? "warning" : "ink"
                }
              >
                {item.accent}
              </Badge>
            </td>

            <td>
              <span style={{ fontSize: "0.8125rem", color: "#4a5568" }}>
                {Array.isArray(item.items) ? `${item.items.length} mục` : "0 mục"}
              </span>
            </td>

            <td style={{ textAlign: "center" }}>
              <button
                type="button"
                className={`${styles.featuredToggle} ${
                  item.featured ? styles.featuredActive : styles.featuredInactive
                }`}
                onClick={() => onToggleFeatured(item)}
                disabled={isUpdating}
                title="Bấm để bật/tắt hiển thị nổi bật"
              >
                {item.featured ? (
                  <>
                    <StarSolid style={{ width: 14, height: 14, color: "#d97706" }} />
                    <span>Nổi bật</span>
                  </>
                ) : (
                  <>
                    <StarIcon style={{ width: 14, height: 14 }} />
                    <span>Thường</span>
                  </>
                )}
              </button>
            </td>

            <td>
              <div className={styles.actionBtnGroup}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => onEdit(item)}
                  title="Chỉnh sửa dịch vụ"
                  aria-label={`Chỉnh sửa ${item.title}`}
                >
                  <PencilSquareIcon style={{ width: 16, height: 16 }} />
                </button>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => onDelete(item)}
                  title="Xoá dịch vụ"
                  aria-label={`Xoá ${item.title}`}
                >
                  <TrashIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </td>
          </AdminTableRow>
        );
      })}
    </AdminTable>
  );
}
