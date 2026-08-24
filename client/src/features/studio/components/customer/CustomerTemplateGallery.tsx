import React, { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import type { StudioTemplateRow } from "../../../../lib/types";
import { SparklesIcon, SwatchIcon } from "@heroicons/react/24/outline";

export interface CustomerTemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void;
}

export const CustomerTemplateGallery: React.FC<CustomerTemplateGalleryProps> = ({
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<StudioTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    api
      .getStudioTemplates()
      .then((rows) => {
        setTemplates(rows.filter((t) => t.is_active));
      })
      .catch((err) => console.warn("Failed to load customer studio templates:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: "all", label: "Tất Cả Mẫu" },
    { id: "fabric", label: "Phông Rèm" },
    { id: "flowers", label: "Cụm Hoa" },
    { id: "luxury", label: "Sang Trọng" },
  ];

  const filteredTemplates = templates.filter((tpl) => {
    if (activeCategory === "all") return true;
    return tpl.category === activeCategory;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4eee3",
        color: "#271620",
        padding: "40px 24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Banner Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "36px",
            background: "linear-gradient(180deg, #ffffff 0%, #fbf7f1 100%)",
            padding: "40px 28px",
            borderRadius: "24px",
            border: "1px solid #e7ded0",
            boxShadow: "0 8px 30px rgba(39, 22, 32, 0.05)",
          }}
        >
          
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              fontFamily: "'Fraunces', serif",
              color: "#271620",
              margin: "0 0 12px 0",
              letterSpacing: "-0.5px",
            }}
          >
            Studio Thiết Kế Phông Cưới Pi Decor
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "#6e6259",
              maxWidth: "640px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Khám phá các mẫu phông cưới phối sẵn trọn bộ bởi đội ngũ designer chuyên nghiệp. Chọn một mẫu thiết kế bên dưới để tùy chỉnh rèm, hoa, phông chữ 3D theo phong cách riêng của bạn.
          </p>

          {/* Category Filter Tabs */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "28px",
              flexWrap: "wrap",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: "600",
                  borderRadius: "20px",
                  border: activeCategory === cat.id ? "1px solid #a15c2e" : "1px solid #e7ded0",
                  backgroundColor: activeCategory === cat.id ? "#a15c2e" : "#ffffff",
                  color: activeCategory === cat.id ? "#ffffff" : "#6e6259",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: activeCategory === cat.id ? "0 2px 6px rgba(161, 92, 46, 0.25)" : "none",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
            <p style={{ color: "#6e6259", fontSize: "14px" }}>Đang tải danh sách mẫu thiết kế phông cưới…</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px dashed #e7ded0",
            }}
          >
            <SwatchIcon style={{ width: "48px", height: "48px", color: "#9c9186", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#271620", margin: "0 0 8px 0" }}>
              Chưa Có Mẫu Phông Phù Hợp
            </h3>
            <p style={{ color: "#6e6259", fontSize: "13px", margin: 0 }}>
              Hiện chưa có mẫu thiết kế nào thuộc danh mục này. Vui lòng chọn danh mục khác.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl.id)}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e7ded0",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 16px rgba(39, 22, 32, 0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "#a15c2e";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(161, 92, 46, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#e7ded0";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(39, 22, 32, 0.05)";
                }}
              >
                {/* Thumbnail Preview / SVG Canvas Preview */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "800 / 600",
                    backgroundColor: "#fbf7f1",
                    position: "relative",
                    overflow: "hidden",
                    borderBottom: "1px solid #e7ded0",
                  }}
                >
                  {tpl.thumbnail ? (
                    <img
                      src={tpl.thumbnail}
                      alt={tpl.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{ width: "100%", height: "100%", overflow: "hidden" }}
                      dangerouslySetInnerHTML={{ __html: tpl.svg_base }}
                    />
                  )}

                  {/* Category Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      backgroundColor: "rgba(251, 247, 241, 0.92)",
                      backdropFilter: "blur(4px)",
                      color: "#a15c2e",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      border: "1px solid rgba(161, 92, 46, 0.25)",
                      textTransform: "uppercase",
                    }}
                  >
                    {tpl.category === "fabric" ? "Rèm Nền" : tpl.category === "flowers" ? "Cụm Hoa" : "Phông Cưới"}
                  </div>
                </div>

                {/* Template Content Footer */}
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#271620", margin: "0 0 6px 0" }}>
                      {tpl.name}
                    </h3>
                    <p style={{ fontSize: "12px", color: "#6e6259", margin: 0, lineHeight: "1.5" }}>
                      Mẫu phối sẵn kết hợp phông rèm cao cấp, cụm hoa nghệ thuật và bộ chữ 3D.
                    </p>
                  </div>

                  <button
                    type="button"
                    style={{
                      marginTop: "auto",
                      width: "100%",
                      padding: "10px 16px",
                      backgroundColor: "#a15c2e",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "background-color 0.15s ease",
                      boxShadow: "0 2px 6px rgba(161, 92, 46, 0.25)",
                    }}
                  >
                    <SparklesIcon style={{ width: "16px", height: "16px" }} />
                    <span>Tùy Chỉnh Thiết Kế Mẫu Này</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
