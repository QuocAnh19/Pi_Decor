import { PencilSquareIcon, TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { AdminTable, AdminTableRow } from "../../../components/admin";
import type { MaterialItem } from "../../../lib/types";
import styles from "./MaterialList.module.scss";

export const MATERIAL_CATEGORY_LABELS: Record<string, string> = {
  fabric: "Rèm nền",
  drape_detail: "Rèm chi tiết",
  drape: "Rèm chi tiết",
  flowers: "Cụm hoa",
  flower: "Cụm hoa",
  text_name: "Dãy chữ số",
  text_date: "Dãy chữ số",
  text: "Dãy chữ số",
};

interface MaterialTableViewProps {
  materials: MaterialItem[];
  onEdit: (material: MaterialItem) => void;
  onDelete: (material: MaterialItem) => void;
}

/**
 * Chế độ hiển thị bảng danh sách vật liệu trong kho.
 */
export function MaterialTableView({ materials, onEdit, onDelete }: MaterialTableViewProps) {
  return (
    <AdminTable
      headers={[
        "Hình ảnh & Tên vật liệu",
        "Phân loại",
        "Mã màu / Định dạng",
        "Mã định danh (ID)",
        { label: "Thao tác", align: "right" },
      ]}
    >
      {materials.map((mat) => (
        <AdminTableRow key={mat.id}>
          <td
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "42px",
                borderRadius: "8px",
                border: "1px solid #e7ded0",
                backgroundColor: "#fbf7f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {mat.image_url ? (
                <img
                  src={mat.image_url}
                  alt={mat.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : mat.color_hex ? (
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: mat.color_hex,
                    border: "1px solid #e7ded0",
                  }}
                />
              ) : (
                <PhotoIcon
                  className="h-5 w-5"
                  style={{ width: 20, height: 20, color: "#9c9186" }}
                />
              )}
            </div>
            <div>
              <div
                style={{
                  fontWeight: "700",
                  color: "#271620",
                  fontSize: "14px",
                }}
              >
                {mat.name}
              </div>
            </div>
          </td>

          <td style={{ padding: "12px 16px" }}>
            <span
              style={{
                backgroundColor: "#f1e4d8",
                color: "#a15c2e",
                fontSize: "11px",
                fontWeight: "700",
                padding: "3px 8px",
                borderRadius: "9999px",
                border: "1px solid rgba(161, 92, 46, 0.2)",
              }}
            >
              #{MATERIAL_CATEGORY_LABELS[mat.category] ?? mat.category}
            </span>
          </td>

          <td style={{ padding: "12px 16px", color: "#6e6259" }}>
            {mat.color_hex ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: mat.color_hex,
                    border: "1px solid #e7ded0",
                    display: "inline-block",
                  }}
                />
                <code style={{ fontSize: "12px", fontFamily: "monospace" }}>{mat.color_hex}</code>
              </div>
            ) : mat.image_url ? (
              <span style={{ fontSize: "12px", color: "#6e6259" }}>Tệp hình ảnh</span>
            ) : (
              "—"
            )}
          </td>

          <td
            style={{
              padding: "12px 16px",
              color: "#9c9186",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          >
            {mat.id}
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
                type="button"
                onClick={() => onEdit(mat)}
                className={styles.iconBtn}
                title="Chỉnh sửa vật liệu"
              >
                <PencilSquareIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} /> Sửa
              </button>
              <button
                type="button"
                onClick={() => onDelete(mat)}
                className={`${styles.iconBtn} ${styles.dangerBtn}`}
                title="Xóa vật liệu"
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
