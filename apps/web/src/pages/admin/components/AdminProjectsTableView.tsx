import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { SAMPLE_STOCK_IMAGES, type ProjectItem } from "../../../features/projects";
import { AdminTable, AdminTableRow } from "../../../components/admin";
import { renderProjectStatusBadge } from "./AdminProjectsGridView";
import styles from "../AdminProjectsPage.module.scss";

function getCategoryLabel(catId: string): string {
  if (catId === "piwedding") return "PiWedding";
  if (catId === "pikids") return "PiKids";
  if (catId === "pievent") return "PiEvent";
  return catId;
}

interface AdminProjectsTableViewProps {
  projects: ProjectItem[];
  onEdit: (proj: ProjectItem) => void;
  onDelete: (id: string) => void;
}

/**
 * Chế độ hiển thị bảng danh sách dự án trong trang quản trị.
 */
export function AdminProjectsTableView({
  projects,
  onEdit,
  onDelete,
}: AdminProjectsTableViewProps) {
  return (
    <AdminTable
      headers={[
        "Hình ảnh & Dự án",
        "Phân mục",
        "Địa điểm",
        "Trạng thái",
        { label: "Thao tác", align: "right" },
      ]}
    >
      {projects.map((proj) => (
        <AdminTableRow key={proj.id}>
          <td
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <img
              src={proj.src}
              alt={proj.title}
              style={{
                width: "54px",
                height: "42px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #e7ded0",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = SAMPLE_STOCK_IMAGES[0];
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: "700",
                  color: "#271620",
                  fontSize: "14px",
                }}
              >
                {proj.title}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6e6259",
                  marginTop: "2px",
                }}
              >
                {proj.description?.slice(0, 50)}...
              </div>
            </div>
          </td>
          <td style={{ padding: "12px 16px" }}>
            <span className={styles.categoryBadge}>
              #{getCategoryLabel(proj.categoryId)} • {proj.tag}
            </span>
          </td>
          <td
            style={{
              padding: "12px 16px",
              color: "#6e6259",
              fontWeight: "500",
            }}
          >
            {proj.location}
          </td>
          <td style={{ padding: "12px 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexWrap: "wrap",
              }}
            >
              {renderProjectStatusBadge(proj.status)}
              {proj.priceTier === "premium" && (
                <span className={`${styles.tierBadge} ${styles.tierPremium}`}>Cao cấp</span>
              )}
            </div>
          </td>
          <td style={{ padding: "12px 16px", textAlign: "right" }}>
            <div
              style={{
                display: "flex",
                gap: "6px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => onEdit(proj)}
                className={styles.iconBtn}
                title="Chỉnh sửa dự án"
              >
                <PencilSquareIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} /> Sửa
              </button>
              <button
                onClick={() => onDelete(proj.id)}
                className={`${styles.iconBtn} ${styles.dangerBtn}`}
                title="Xóa dự án"
              >
                <TrashIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </td>
        </AdminTableRow>
      ))}
    </AdminTable>
  );
}
