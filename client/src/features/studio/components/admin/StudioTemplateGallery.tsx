import React from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import type { StudioTemplateRow } from "../../../../lib/types";

export interface StudioTemplateGalleryProps {
  templates: StudioTemplateRow[];
  loading?: boolean;
  onSelectTemplate: (templateId: string) => void;
  onCreateNew: () => void;
  onDeleteTemplate: (templateId: string) => void;
  onToggleActive: (templateId: string, currentActive: boolean) => void;
  onBackToAdmin?: () => void;
}

export const StudioTemplateGallery: React.FC<StudioTemplateGalleryProps> = ({
  templates,
  loading = false,
  onSelectTemplate,
  onCreateNew,
  onDeleteTemplate,
  onToggleActive,
  onBackToAdmin,
}) => {
  const [filterStatus, setFilterStatus] = React.useState<"all" | "published" | "draft">("all");

  const publishedCount = templates.filter((t) => t.is_active).length;
  const draftCount = templates.filter((t) => !t.is_active).length;

  const filteredTemplates = templates.filter((t) => {
    if (filterStatus === "published") return t.is_active;
    if (filterStatus === "draft") return !t.is_active;
    return true;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        padding: "24px 32px",
        boxSizing: "border-box",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#1e293b",
          padding: "16px 24px",
          borderRadius: "16px",
          border: "1px solid #334155",
          marginBottom: "24px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              style={{
                padding: "8px 14px",
                backgroundColor: "#334155",
                color: "#f8fafc",
                border: "none",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ArrowLeftIcon className="h-4 w-4" style={{ width: 16, height: 16 }} /> Quay lại Admin
            </button>
          )}

          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "700",
                fontFamily: "'Fraunces', serif",
                color: "#ffffff",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <PhotoIcon className="h-6 w-6" style={{ width: 24, height: 24, color: "#38bdf8" }} />
              Thư Viện Mẫu Thiết Kế Studio ({templates.length})
            </h1>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", margin: 0 }}>
              Quản lý mẫu thiết kế phông cưới: Tạo mới, lưu nháp hoặc công khai lên Studio khách hàng
            </p>
          </div>
        </div>

        <button
          onClick={onCreateNew}
          style={{
            padding: "10px 20px",
            backgroundColor: "#38bdf8",
            color: "#0f172a",
            border: "none",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(56, 189, 248, 0.3)",
            transition: "all 0.15s ease",
          }}
        >
          <PlusIcon className="h-4 w-4" style={{ width: 18, height: 18 }} /> Tạo Thiết Kế Mới
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "24px",
          backgroundColor: "#1e293b",
          padding: "6px 12px",
          borderRadius: "12px",
          border: "1px solid #334155",
          width: "fit-content",
        }}
      >
        <button
          onClick={() => setFilterStatus("all")}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: filterStatus === "all" ? "#38bdf8" : "transparent",
            color: filterStatus === "all" ? "#0f172a" : "#94a3b8",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Tất cả mẫu ({templates.length})
        </button>

        <button
          onClick={() => setFilterStatus("published")}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: filterStatus === "published" ? "#16a34a" : "transparent",
            color: filterStatus === "published" ? "#ffffff" : "#6ee7b7",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <EyeIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} /> Đang hiển thị ({publishedCount})
        </button>

        <button
          onClick={() => setFilterStatus("draft")}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: filterStatus === "draft" ? "#64748b" : "transparent",
            color: filterStatus === "draft" ? "#ffffff" : "#cbd5e1",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <EyeSlashIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} /> Bản nháp / Đã ẩn ({draftCount})
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <p style={{ fontSize: "16px" }}>Đang tải thư viện thiết kế từ CSDL...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", backgroundColor: "#1e293b", borderRadius: "16px", border: "1px solid #334155", color: "#94a3b8" }}>
          <p style={{ fontSize: "15px", fontWeight: "600" }}>Không có mẫu thiết kế nào ở trạng thái này.</p>
        </div>
      ) : (
        /* Templates Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Existing Templates Cards */}
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "16px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#334155";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Card Preview Container */}
              <div
                onClick={() => onSelectTemplate(tpl.id)}
                style={{
                  height: "180px",
                  backgroundColor: "#0f172a",
                  position: "relative",
                  cursor: "pointer",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: "1px solid #334155",
                }}
              >
                {tpl.thumbnail ? (
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                  <PhotoIcon className="h-10 w-10" style={{ width: 40, height: 40, color: "#64748b" }} />
                )}

                {/* Status Badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(tpl.id, tpl.is_active);
                  }}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: tpl.is_active ? "rgba(22, 163, 74, 0.9)" : "rgba(100, 116, 139, 0.9)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "20px",
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
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

              {/* Card Info & Actions */}
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                <div>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#f8fafc",
                      margin: 0,
                      lineHeight: "1.3",
                    }}
                  >
                    {tpl.name}
                  </h3>
                  <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", margin: 0 }}>
                    Cập nhật: {new Date(tpl.updated_at || tpl.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "auto",
                  }}
                >
                  <button
                    onClick={() => onSelectTemplate(tpl.id)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      backgroundColor: "#38bdf8",
                      color: "#0f172a",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    <PencilSquareIcon className="h-4 w-4" style={{ width: 16, height: 16 }} /> Chỉnh Sửa
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Bạn có chắc muốn xóa mẫu '${tpl.name}'?`)) {
                        onDeleteTemplate(tpl.id);
                      }
                    }}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "rgba(225, 29, 72, 0.15)",
                      color: "#f43f5e",
                      border: "1px solid rgba(244, 63, 94, 0.3)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    title="Xóa mẫu thiết kế này"
                  >
                    <TrashIcon className="h-4 w-4" style={{ width: 16, height: 16 }} /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
