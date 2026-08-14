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
        // Only display active templates approved by admin
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
        backgroundColor: "#0f172a",
        color: "#f8fafc",
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
            background: "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 70%)",
            padding: "36px 24px",
            borderRadius: "20px",
            border: "1px solid #334155",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              backgroundColor: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "20px",
              color: "#38bdf8",
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            <SparklesIcon style={{ width: "16px", height: "16px" }} />
            <span>Interactive Studio Builder 3D</span>
          </div>

          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              fontFamily: "'Fraunces', serif",
              color: "#ffffff",
              margin: "0 0 12px 0",
              letterSpacing: "-0.5px",
            }}
          >
            Studio Thiết Kế Phông Cưới Pi Decor
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "#94a3b8",
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
                  border: activeCategory === cat.id ? "1px solid #38bdf8" : "1px solid #334155",
                  backgroundColor: activeCategory === cat.id ? "rgba(56, 189, 248, 0.15)" : "#1e293b",
                  color: activeCategory === cat.id ? "#38bdf8" : "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
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
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>Đang tải danh sách mẫu thiết kế phông cưới…</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              backgroundColor: "#1e293b",
              borderRadius: "16px",
              border: "1px dashed #334155",
            }}
          >
            <SwatchIcon style={{ width: "48px", height: "48px", color: "#64748b", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", margin: "0 0 8px 0" }}>
              Chưa Có Mẫu Phông Phù Hợp
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
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
                  backgroundColor: "#1e293b",
                  borderRadius: "16px",
                  border: "1px solid #334155",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "#38bdf8";
                  e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(56, 189, 248, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#334155";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.3)";
                }}
              >
                {/* Thumbnail Preview / SVG Canvas Preview */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "800 / 600",
                    backgroundColor: "#0f172a",
                    position: "relative",
                    overflow: "hidden",
                    borderBottom: "1px solid #334155",
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
                      backgroundColor: "rgba(15, 23, 42, 0.85)",
                      backdropFilter: "blur(4px)",
                      color: "#38bdf8",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      textTransform: "uppercase",
                    }}
                  >
                    {tpl.category === "fabric" ? "Rèm Nền" : tpl.category === "flowers" ? "Cụm Hoa" : "Phông Cưới"}
                  </div>
                </div>

                {/* Template Content Footer */}
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", margin: "0 0 6px 0" }}>
                      {tpl.name}
                    </h3>
                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
                      Mẫu phối sẵn kết hợp phông rèm cao cấp, cụm hoa nghệ thuật và bộ chữ 3D.
                    </p>
                  </div>

                  <button
                    type="button"
                    style={{
                      marginTop: "auto",
                      width: "100%",
                      padding: "10px 16px",
                      backgroundColor: "#38bdf8",
                      color: "#0f172a",
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
                    }}
                  >
                    <SparklesIcon style={{ width: "16px", height: "16px" }} />
                    <span>✨ Tùy Chỉnh Thiết Kế Mẫu Này</span>
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
