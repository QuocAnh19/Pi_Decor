import {
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { AdminTable, AdminTableRow } from "../../../components/admin";
import type { StudioTemplateRow } from "../../../lib/types";
import styles from "../AdminStudioPage.module.scss";

interface AdminStudioTemplatesListViewProps {
  templates: StudioTemplateRow[];
  viewMode: "grid" | "table";
  onSelectTemplate: (id: string) => void;
  onToggleActive: (id: string, currentActive: boolean) => void;
  onRenamePrompt: (id: string, currentName: string) => void;
  onRequestDelete: (item: { id: string; name?: string }) => void;
}

/**
 * Hiển thị danh sách mẫu thiết kế Studio ở chế độ lưới (grid) hoặc bảng (table).
 */
export function AdminStudioTemplatesListView({
  templates,
  viewMode,
  onSelectTemplate,
  onToggleActive,
  onRenamePrompt,
  onRequestDelete,
}: AdminStudioTemplatesListViewProps) {
  if (viewMode === "grid") {
    return (
      <div className={styles.grid}>
        {templates.map((tpl) => (
          <div key={tpl.id} className={styles.card}>
            <div
              className={styles.cardImageWrapper}
              onClick={() => onSelectTemplate(tpl.id)}
            >
              {tpl.thumbnail ? (
                <img
                  src={tpl.thumbnail}
                  alt={tpl.name}
                  className={styles.cardImage}
                />
              ) : tpl.svg_base ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: "scale(0.35)",
                    transformOrigin: "center center",
                    pointerEvents: "none",
                  }}
                  dangerouslySetInnerHTML={{ __html: tpl.svg_base }}
                />
              ) : (
                <PhotoIcon className="h-10 w-10" style={{ width: 40, height: 40, color: "#9c9186" }} />
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleActive(tpl.id, tpl.is_active);
                }}
                className={`${styles.statusBadge} ${tpl.is_active ? styles.statusActive : styles.statusDraft}`}
              >
                {tpl.is_active ? (
                  <>
                    <EyeIcon className="h-3 w-3" style={{ width: 12, height: 12 }} /> Đang hiển thị
                  </>
                ) : (
                  <>
                    <EyeSlashIcon className="h-3 w-3" style={{ width: 12, height: 12 }} /> Đã ẩn (Nháp)
                  </>
                )}
              </button>
            </div>

            <div className={styles.cardBody}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <h3
                    className={styles.cardTitle}
                    style={{ cursor: "pointer" }}
                    onClick={() => onRenamePrompt(tpl.id, tpl.name)}
                    title="Nhấp để đổi tên mẫu"
                  >
                    {tpl.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => onRenamePrompt(tpl.id, tpl.name)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#a15c2e",
                      cursor: "pointer",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Đổi tên mẫu thiết kế"
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                  </button>
                </div>
                <p className={styles.cardMeta}>
                  Mã: <span style={{ fontFamily: "monospace", color: "#a15c2e" }}>{tpl.id}</span> • Cập nhật:{" "}
                  {new Date(tpl.updated_at || tpl.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  onClick={() => onSelectTemplate(tpl.id)}
                  className={styles.editBtn}
                >
                  <PencilSquareIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                  Chỉnh Sửa
                </button>

                <button
                  type="button"
                  onClick={() => onRequestDelete({ id: tpl.id, name: tpl.name })}
                  className={styles.deleteBtn}
                  title="Xóa mẫu thiết kế này"
                >
                  <TrashIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <AdminTable
      headers={[
        "Xem trước & Tên mẫu thiết kế",
        "Trạng thái",
        "Ngày tạo / Cập nhật",
        { label: "Thao tác", align: "right" },
      ]}
    >
      {templates.map((tpl) => (
        <AdminTableRow key={tpl.id}>
          <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "60px",
                height: "44px",
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
              {tpl.thumbnail ? (
                <img
                  src={tpl.thumbnail}
                  alt={tpl.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <PhotoIcon className="h-5 w-5" style={{ width: 20, height: 20, color: "#9c9186" }} />
              )}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{ fontWeight: "700", color: "#271620", fontSize: "14px", cursor: "pointer" }}
                  onClick={() => onRenamePrompt(tpl.id, tpl.name)}
                  title="Nhấp để đổi tên mẫu"
                >
                  {tpl.name}
                </span>
                <button
                  type="button"
                  onClick={() => onRenamePrompt(tpl.id, tpl.name)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#a15c2e",
                    cursor: "pointer",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Đổi tên mẫu"
                >
                  <PencilSquareIcon className="h-3 w-3" style={{ width: 12, height: 12 }} />
                </button>
              </div>
              <div style={{ fontSize: "11px", color: "#9c9186", fontFamily: "monospace" }}>
                {tpl.id}
              </div>
            </div>
          </td>

          <td style={{ padding: "12px 16px" }}>
            <button
              type="button"
              onClick={() => onToggleActive(tpl.id, tpl.is_active)}
              className={`${styles.statusBadge} ${tpl.is_active ? styles.statusActive : styles.statusDraft}`}
              style={{ position: "static" }}
            >
              {tpl.is_active ? (
                <>
                  <EyeIcon className="h-3 w-3" style={{ width: 12, height: 12 }} /> Đang hiển thị
                </>
              ) : (
                <>
                  <EyeSlashIcon className="h-3 w-3" style={{ width: 12, height: 12 }} /> Đã ẩn
                </>
              )}
            </button>
          </td>

          <td style={{ padding: "12px 16px", color: "#6e6259", fontSize: "12px" }}>
            {new Date(tpl.updated_at || tpl.created_at).toLocaleDateString("vi-VN")}
          </td>

          <td style={{ padding: "12px 16px", textAlign: "right" }}>
            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => onSelectTemplate(tpl.id)}
                className={styles.editBtn}
                style={{ padding: "6px 12px", flex: "none" }}
              >
                <PencilSquareIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} /> Sửa
              </button>

              <button
                type="button"
                onClick={() => onRequestDelete({ id: tpl.id, name: tpl.name })}
                className={styles.deleteBtn}
                style={{ padding: "6px 10px" }}
                title="Xóa mẫu"
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
