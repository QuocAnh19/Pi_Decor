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
      const cat = (mat.category || "").toLowerCase().trim();
      let matchesCategory = true;

      if (activeTab === "fabric") {
        matchesCategory = cat === "fabric" || cat.includes("rèm nền") || cat === "drape" || cat.includes("rèm");
      } else if (activeTab === "drape_detail") {
        matchesCategory = cat === "drape_detail" || cat.includes("rèm chi tiết") || cat.includes("detail") || cat.includes("vắt");
      } else if (activeTab === "flowers") {
        matchesCategory = cat === "flowers" || cat === "flower" || cat.includes("hoa");
      } else if (activeTab === "text_name") {
        matchesCategory = cat === "text_name" || cat === "text_date" || cat === "text" || cat.includes("chữ");
      }

      if (!matchesCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (mat.name || "").toLowerCase().includes(q) || cat.includes(q);
      }
      return true;
    });
  }, [materials, activeTab, searchQuery]);

  if (!slot) {
    return (
      <div
        style={{
          backgroundColor: "#fbf7f1",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #e7ded0",
          color: "#6e6259",
          fontSize: "13px",
          textAlign: "center",
        }}
      >
        Hãy chọn một Slot trên Canvas để gán vật liệu từ thư viện.
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        padding: "14px",
        border: "1px solid #e7ded0",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "0 4px 16px rgba(39, 22, 32, 0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#a15c2e", margin: 0 }}>
          Gán vật liệu cho: <span style={{ color: "#271620" }}>{slot.label}</span>
        </h4>
        <span style={{ fontSize: "11px", color: "#6e6259", fontWeight: "600" }}>
          ({filteredMaterials.length})
        </span>
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          backgroundColor: "#f4eee3",
          padding: "4px",
          borderRadius: "8px",
          border: "1px solid #e7ded0",
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
              padding: "5px 6px",
              fontSize: "11px",
              fontWeight: "600",
              border: "none",
              borderRadius: "6px",
              backgroundColor: activeTab === tab.id ? "#a15c2e" : "transparent",
              color: activeTab === tab.id ? "#ffffff" : "#6e6259",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
              boxShadow: activeTab === tab.id ? "0 1px 3px rgba(161, 92, 46, 0.25)" : "none",
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
        <p style={{ fontSize: "12px", color: "#6e6259", textAlign: "center", padding: "12px" }}>
          Đang tải vật liệu…
        </p>
      ) : filteredMaterials.length === 0 ? (
        <p style={{ fontSize: "12px", color: "#9c9186", textAlign: "center", padding: "16px" }}>
          Chưa có vật liệu nào phù hợp bộ lọc này.
        </p>
      ) : (
        <div
          className="custom-scroll"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
            maxHeight: "320px",
            overflowY: "auto",
            paddingRight: "4px",
            overscrollBehavior: "contain",
          }}
        >
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              onClick={() => onAssignMaterial(mat, slot)}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e7ded0",
                borderRadius: "10px",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
                boxShadow: "0 2px 6px rgba(39, 22, 32, 0.04)",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#a15c2e";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(161, 92, 46, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e7ded0";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(39, 22, 32, 0.04)";
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "80px",
                  backgroundColor: "#fbf7f1",
                  borderRadius: "8px",
                  border: "1px solid #e7ded0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: "4px",
                }}
              >
                {mat.image_url ? (
                  <img
                    src={mat.image_url}
                    alt={mat.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : mat.color_hex ? (
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: mat.color_hex,
                      border: "2px solid rgba(255, 255, 255, 0.8)",
                      boxShadow: "0 2px 8px rgba(39, 22, 32, 0.15)",
                    }}
                  />
                ) : (
                  <span style={{ color: "#9c9186", fontSize: "10px" }}>Không có ảnh</span>
                )}
              </div>

              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#271620",
                  textAlign: "center",
                  lineHeight: "1.3",
                  wordBreak: "break-word",
                }}
              >
                {mat.name}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignMaterial(mat, slot);
                }}
                style={{
                  width: "100%",
                  padding: "5px",
                  fontSize: "10px",
                  fontWeight: "700",
                  backgroundColor: "#a15c2e",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(161, 92, 46, 0.2)",
                  transition: "all 0.15s ease",
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
