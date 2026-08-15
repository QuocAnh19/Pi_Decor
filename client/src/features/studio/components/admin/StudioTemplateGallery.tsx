import React, { useMemo, useState } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { SearchInput, Select } from "../../../../components/ui";
import type { StudioTemplateRow } from "../../../../lib/types";

export interface StudioTemplateGalleryProps {
  templates: StudioTemplateRow[];
  loading?: boolean;
  onSelectTemplate: (templateId: string) => void;
  onCreateNew?: () => void;
  onDeleteTemplate: (templateId: string) => void;
  onToggleActive: (templateId: string, currentActive: boolean) => void;
  onBackToAdmin?: () => void;
}

export const StudioTemplateGallery: React.FC<StudioTemplateGalleryProps> = ({
  templates,
  loading = false,
  onSelectTemplate,
  onDeleteTemplate,
  onToggleActive,
  onBackToAdmin,
}) => {
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const publishedCount = templates.filter((t) => t.is_active).length;
  const draftCount = templates.filter((t) => !t.is_active).length;

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (filterStatus === "published" && !t.is_active) return false;
      if (filterStatus === "draft" && t.is_active) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = t.name?.toLowerCase().includes(q);
        const matchId = t.id?.toLowerCase().includes(q);
        if (!matchName && !matchId) return false;
      }
      return true;
    });
  }, [templates, filterStatus, searchQuery]);

  const tabs = [
    { id: "all", label: `Tất cả mẫu (${templates.length})` },
    { id: "published", label: `Đang hiển thị (${publishedCount})` },
    { id: "draft", label: `Bản nháp / Đã ẩn (${draftCount})` },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4eee3",
        color: "#271620",
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
          backgroundColor: "#ffffff",
          padding: "16px 24px",
          borderRadius: "16px",
          border: "1px solid #e7ded0",
          marginBottom: "20px",
          boxShadow: "0 4px 16px rgba(39, 22, 32, 0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              style={{
                padding: "8px 14px",
                backgroundColor: "#fbf7f1",
                color: "#271620",
                border: "1px solid #e7ded0",
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
                color: "#271620",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <PhotoIcon className="h-6 w-6" style={{ width: 24, height: 24, color: "#a15c2e" }} />
              Thư Viện Mẫu Thiết Kế Studio
            </h1>
            <p style={{ fontSize: "12px", color: "#6e6259", marginTop: "4px", margin: 0 }}>
              Quản lý mẫu thiết kế phông cưới: Tạo mới, lưu nháp hoặc công khai lên Studio khách hàng
            </p>
          </div>
        </div>

        
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          backgroundColor: "#ffffff",
          padding: "16px",
          borderRadius: "16px",
          border: "1px solid #e7ded0",
          boxShadow: "0 4px 16px rgba(39, 22, 32, 0.04)",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <SearchInput
              placeholder="Tìm theo tên mẫu thiết kế hoặc mã mẫu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ minWidth: "180px" }}>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "published", label: "Đang hiển thị" },
                { value: "draft", label: "Bản nháp / Đã ẩn" },
              ]}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "4px",
              backgroundColor: "#ffffff",
              padding: "4px",
              borderRadius: "8px",
              border: "1px solid #e7ded0",
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              style={{
                padding: "6px 10px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: viewMode === "grid" ? "#a15c2e" : "transparent",
                color: viewMode === "grid" ? "#ffffff" : "#6e6259",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "all 0.15s ease",
              }}
              title="Xem dạng lưới"
            >
              <Squares2X2Icon className="h-4 w-4" style={{ width: 16, height: 16 }} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              style={{
                padding: "6px 10px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: viewMode === "table" ? "#a15c2e" : "transparent",
                color: viewMode === "table" ? "#ffffff" : "#6e6259",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "all 0.15s ease",
              }}
              title="Xem dạng bảng"
            >
              <ListBulletIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              style={{
                padding: "6px 14px",
                borderRadius: "9999px",
                border: "1px solid #e7ded0",
                backgroundColor: filterStatus === tab.id ? "#a15c2e" : "#fbf7f1",
                color: filterStatus === tab.id ? "#ffffff" : "#6e6259",
                fontSize: "12px",
                fontWeight: filterStatus === tab.id ? "700" : "500",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#6e6259" }}>
          <p style={{ fontSize: "16px" }}>Đang nạp thư viện thiết kế từ máy chủ...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px dashed #e7ded0",
            color: "#6e6259",
          }}
        >
          <PhotoIcon className="h-10 w-10" style={{ width: 40, height: 40, color: "#9c9186", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "15px", fontWeight: "700", color: "#271620", margin: 0 }}>
            Không tìm thấy mẫu thiết kế phù hợp
          </p>
          <p style={{ fontSize: "12px", color: "#9c9186", marginTop: "4px" }}>
            Thử thay đổi từ khóa tìm kiếm hoặc bấm "Tạo Thiết Kế Mới".
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* Templates Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e7ded0",
                borderRadius: "16px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 16px rgba(39, 22, 32, 0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#a15c2e";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(161, 92, 46, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e7ded0";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(39, 22, 32, 0.04)";
              }}
            >
              {/* Card Preview Container */}
              <div
                onClick={() => onSelectTemplate(tpl.id)}
                style={{
                  height: "180px",
                  backgroundColor: "#fbf7f1",
                  position: "relative",
                  cursor: "pointer",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: "1px solid #e7ded0",
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
                  <PhotoIcon className="h-10 w-10" style={{ width: 40, height: 40, color: "#9c9186" }} />
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
                    backgroundColor: tpl.is_active ? "#eef4ea" : "#f4eee3",
                    color: tpl.is_active ? "#47663b" : "#6e6259",
                    border: `1px solid ${tpl.is_active ? "#c5dfbb" : "#e7ded0"}`,
                    borderRadius: "20px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(39, 22, 32, 0.08)",
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
                      color: "#271620",
                      margin: 0,
                      lineHeight: "1.3",
                    }}
                  >
                    {tpl.name}
                  </h3>
                  <p style={{ fontSize: "11px", color: "#6e6259", marginTop: "4px", margin: 0 }}>
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
                      backgroundColor: "#a15c2e",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      boxShadow: "0 2px 6px rgba(161, 92, 46, 0.2)",
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
                      backgroundColor: "#faebea",
                      color: "#b4586b",
                      border: "1px solid #b4586b",
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
      ) : (
        /* Templates Table View */
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e7ded0",
            boxShadow: "0 4px 16px rgba(39, 22, 32, 0.04)",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
              color: "#271620",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#fbf7f1",
                  borderBottom: "1px solid #e7ded0",
                  textAlign: "left",
                  color: "#6e6259",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                <th style={{ padding: "14px 16px" }}>Xem trước &amp; Tên mẫu thiết kế</th>
                <th style={{ padding: "14px 16px" }}>Trạng thái</th>
                <th style={{ padding: "14px 16px" }}>Ngày tạo / Cập nhật</th>
                <th style={{ padding: "14px 16px", textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map((tpl) => (
                <tr
                  key={tpl.id}
                  style={{
                    borderBottom: "1px solid #e7ded0",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fdf7f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
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
                      <div style={{ fontWeight: "700", color: "#271620", fontSize: "14px" }}>
                        {tpl.name}
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
                      style={{
                        backgroundColor: tpl.is_active ? "#eef4ea" : "#f4eee3",
                        color: tpl.is_active ? "#47663b" : "#6e6259",
                        border: `1px solid ${tpl.is_active ? "#c5dfbb" : "#e7ded0"}`,
                        borderRadius: "20px",
                        padding: "3px 10px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
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
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#a15c2e",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} /> Sửa
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa mẫu '${tpl.name}'?`)) {
                            onDeleteTemplate(tpl.id);
                          }
                        }}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#faebea",
                          color: "#b4586b",
                          border: "1px solid #b4586b",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        title="Xóa mẫu"
                      >
                        <TrashIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

