import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../../../lib/api";
import type { MaterialItem } from "../../../../lib/types";
import { SearchInput } from "../../../../components/ui";
import { SlotDefinition } from "../../types";

export interface MaterialPickerForSlotProps {
  slot: SlotDefinition | null;
  onAssignMaterial: (material: MaterialItem, slot: SlotDefinition) => void;
}

const CATEGORIES = [
  { id: "all", label: "Tất cả", catKey: "" },
  { id: "fabric", label: "Rèm Nền", catKey: "fabric" },
  { id: "drape_detail", label: "Rèm Chi Tiết", catKey: "drape_detail" },
  { id: "flowers", label: "Cụm Hoa", catKey: "flowers" },
  { id: "text_name", label: "Dãy Chữ Số", catKey: "text_name" },
];

export const MaterialPickerForSlot: React.FC<MaterialPickerForSlotProps> = ({
  slot,
  onAssignMaterial,
}) => {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load materials from database
  useEffect(() => {
    setLoading(true);
    api
      .getMaterials()
      .then((data) => setMaterials(data))
      .catch((err) => console.warn("Failed to load materials:", err))
      .finally(() => setLoading(false));
  }, []);

  // Auto switch tab to match current slot type
  useEffect(() => {
    if (slot) {
      switch (slot.slotType) {
        case "drape":
          setActiveTab("fabric");
          break;
        case "drape_detail":
          setActiveTab("drape_detail");
          break;
        case "flower":
        case "flowers" as unknown:
          setActiveTab("flowers");
          break;
        case "text_name":
        case "text_date":
          setActiveTab("text_name");
          break;
        default:
          setActiveTab("all");
      }
    }
  }, [slot]);

  // Filter materials by tab & search query
  const filteredMaterials = useMemo(() => {
    return materials.filter((mat) => {
      let matchesCategory = true;
      if (activeTab === "fabric") {
        matchesCategory = mat.category === "fabric" || mat.category === "rèm nền";
      } else if (activeTab === "drape_detail") {
        matchesCategory = mat.category === "drape_detail" || mat.category === "rèm chi tiết" || mat.category === "drape";
      } else if (activeTab === "flowers") {
        matchesCategory = mat.category === "flowers" || mat.category === "flower" || mat.category === "cụm hoa";
      } else if (activeTab === "text_name") {
        matchesCategory = mat.category === "text_name" || mat.category === "text_date" || mat.category === "dãy chữ số";
      }

      if (!matchesCategory) return false;

      if (searchQuery.trim()) {
        return mat.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      }
      return true;
    });
  }, [materials, activeTab, searchQuery]);

  if (!slot) {
    return (
      <div
        style={{
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #334155",
          color: "#94a3b8",
          fontSize: "13px",
          textAlign: "center",
        }}
      >
        👈 Hãy chọn một Slot trên Canvas để gán vật liệu từ thư viện.
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        borderRadius: "12px",
        padding: "16px",
        border: "1px solid #334155",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#38bdf8", margin: 0 }}>
          📦 Chọn Vật Liệu Gán Cho: <span style={{ color: "#ffffff" }}>{slot.label}</span>
        </h4>
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          backgroundColor: "#0f172a",
          padding: "4px",
          borderRadius: "8px",
          overflowX: "auto",
        }}
      >
        {CATEGORIES.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "6px 8px",
              fontSize: "11px",
              fontWeight: "600",
              border: "none",
              borderRadius: "6px",
              backgroundColor: activeTab === tab.id ? "#38bdf8" : "transparent",
              color: activeTab === tab.id ? "#0f172a" : "#94a3b8",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <SearchInput
        placeholder="Tìm vật liệu..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Material Grid */}
      {loading ? (
        <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", padding: "12px" }}>
          Đang tải vật liệu…
        </p>
      ) : filteredMaterials.length === 0 ? (
        <p style={{ fontSize: "12px", color: "#64748b", textAlign: "center", padding: "16px" }}>
          Chưa có vật liệu nào thuộc danh mục này. Hãy thêm vật liệu ở trang <strong style={{ color: "#38bdf8" }}>Vật liệu</strong>.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            maxHeight: "260px",
            overflowY: "auto",
            paddingRight: "4px",
          }}
        >
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              onClick={() => onAssignMaterial(mat, slot)}
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#38bdf8")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#334155")}
            >
              {mat.image_url ? (
                <img
                  src={mat.image_url}
                  alt={mat.name}
                  style={{
                    width: "100%",
                    height: "70px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              ) : mat.color_hex ? (
                <div
                  style={{
                    width: "100%",
                    height: "70px",
                    backgroundColor: mat.color_hex,
                    borderRadius: "6px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "70px",
                    backgroundColor: "#334155",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    fontSize: "11px",
                  }}
                >
                  Không có ảnh
                </div>
              )}

              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#f8fafc",
                  textAlign: "center",
                  lineHeight: "1.3",
                  wordBreak: "break-word",
                }}
              >
                {mat.name}
              </span>

              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "4px",
                  fontSize: "10px",
                  fontWeight: "700",
                  backgroundColor: "#38bdf8",
                  color: "#0f172a",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Gán Vào Slot
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
