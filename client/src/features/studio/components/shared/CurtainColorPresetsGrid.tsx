import React from "react";

const DEFAULT_PRESETS = [
  { name: "Đỏ Đô", hex: "#6A040F" },
  { name: "Trắng", hex: "#FFFFFF" },
  { name: "Vàng Champagne", hex: "#D97706" },
  { name: "Hồng Phấn Pastel", hex: "#F43F5E" },
  { name: "Xanh Navy Cổ Vịt", hex: "#1D4ED8" },
  { name: "Xanh Lục Bảo", hex: "#047857" },
  { name: "Hồng Rose Gold", hex: "#BE185D" },
  { name: "Tím Thạch Anh", hex: "#A21CAF" },
  { name: "Cam Đất Terracotta", hex: "#C2410C" },
  { name: "Ghi Xám Khói", hex: "#64748B" },
];

interface CurtainColorPresetsGridProps {
  currentColorOverride: string;
  customColors: string[];
  onSelectColor: (hex: string) => void;
  onRemoveCustomColor: (hex: string, e: React.MouseEvent) => void;
}

/**
 * Hiển thị danh sách chip mã màu tùy chọn đã nhập và bảng màu rèm phông cưới tiêu chuẩn.
 */
export const CurtainColorPresetsGrid: React.FC<CurtainColorPresetsGridProps> = ({
  currentColorOverride,
  customColors,
  onSelectColor,
  onRemoveCustomColor,
}) => {
  return (
    <>
      {customColors.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span
            style={{ fontSize: "11px", fontWeight: "600", color: "#6e6259" }}
          >
            Mã màu bạn đã nhập ({customColors.length}):
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {customColors.map((hex) => {
              const isSelected =
                currentColorOverride.toUpperCase() === hex.toUpperCase();
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => onSelectColor(hex)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 10px",
                    borderRadius: "14px",
                    border: isSelected
                      ? "2px solid #a15c2e"
                      : "1px solid #e7ded0",
                    backgroundColor: isSelected ? "#fdf7f5" : "#ffffff",
                    color: "#271620",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    cursor: "pointer",
                    boxShadow: isSelected
                      ? "0 2px 6px rgba(161, 92, 46, 0.15)"
                      : "none",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: hex,
                      border: "1px solid rgba(39,22,32,0.2)",
                    }}
                  />
                  <span>{hex}</span>
                  <span
                    onClick={(e) => onRemoveCustomColor(hex, e)}
                    style={{
                      marginLeft: "4px",
                      color: "#b4586b",
                      fontWeight: "bold",
                      fontSize: "12px",
                      padding: "0 2px",
                    }}
                    title="Xóa mã màu này"
                  >
                    ×
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", color: "#6e6259" }}>
          Bảng màu rèm phông cưới tiêu chuẩn:
        </span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "6px",
          }}
        >
          {DEFAULT_PRESETS.map((p) => {
            const isSelected =
              currentColorOverride.toLowerCase() === p.hex.toLowerCase();
            return (
              <button
                key={p.hex}
                type="button"
                onClick={() => onSelectColor(p.hex)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: isSelected
                    ? "2px solid #a15c2e"
                    : "1px solid #e7ded0",
                  backgroundColor: isSelected ? "#fdf7f5" : "#fbf7f1",
                  color: "#271620",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected
                    ? "0 2px 6px rgba(161, 92, 46, 0.12)"
                    : "none",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: p.hex,
                    border: "1.5px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 1px 3px rgba(39,22,32,0.15)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: isSelected ? "700" : "500",
                  }}
                >
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
