import React from "react";
import { SlotDefinition, SlotType } from "../../types";
import { Input, Select } from "../../../../components/ui";

const SLOT_TYPE_OPTIONS = [
  { value: "drape", label: "Rèm nền (fabric / drape)" },
  { value: "drape_detail", label: "Rèm chi tiết (drape_detail)" },
  { value: "flower", label: "Cụm hoa (flowers)" },
  { value: "text_name", label: "Dãy chữ số (text_name)" },
];

const alignBtnStyle: React.CSSProperties = {
  padding: "6px 8px",
  fontSize: "11px",
  fontWeight: "700",
  backgroundColor: "#ffffff",
  color: "#a15c2e",
  border: "1px solid #e7ded0",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

interface SlotAdminCoordSectionProps {
  slot: SlotDefinition;
  isCustomer: boolean;
  onUpdate: (slotId: string, patch: Partial<SlotDefinition>) => void;
}

/**
 * Cụm điều khiển thông tin, căn chỉnh nhanh và toạ độ chuẩn hoá của Slot.
 */
export const SlotAdminCoordSection: React.FC<SlotAdminCoordSectionProps> = ({
  slot,
  isCustomer,
  onUpdate,
}) => {
  const handleCoordChange =
    (field: "normX" | "normY" | "normWidth" | "normHeight", min: number, max: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        onUpdate(slot.id, { [field]: Math.max(min, Math.min(max, val)) });
      }
    };

  const renderAlignButton = (title: string, label: string, patch: Partial<SlotDefinition>) => (
    <button
      type="button"
      title={title}
      onClick={() => onUpdate(slot.id, patch)}
      style={alignBtnStyle}
    >
      {label}
    </button>
  );

  return (
    <>
      {!isCustomer && (
        <>
          <div>
            <Input
              label="Tên hiển thị"
              type="text"
              value={slot.label}
              onChange={(e) => onUpdate(slot.id, { label: e.target.value })}
            />
          </div>

          <div>
            <Select
              label="Loại slot"
              value={slot.slotType}
              onChange={(e) => onUpdate(slot.id, { slotType: e.target.value as SlotType })}
              options={SLOT_TYPE_OPTIONS}
            />
          </div>
        </>
      )}

      {/* Quick Alignment Tools Grid */}
      <div
        style={{
          backgroundColor: "#fbf7f1",
          padding: "12px 14px",
          borderRadius: "10px",
          border: "1px solid #e7ded0",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#6e6259",
            display: "block",
          }}
        >
          Căn chỉnh vị trí nhanh:
        </span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
          }}
        >
          {renderAlignButton("Căn giữa trục ngang (X = 0.50)", "↔ Căn Giữa Ngang", { normX: 0.5 })}
          {renderAlignButton("Căn giữa trục dọc (Y = 0.50)", "↕ Căn Giữa Dọc", { normY: 0.5 })}
        </div>
      </div>

      {/* Admin Only: Normalized Coordinate Inputs */}
      {!isCustomer && (
        <div
          style={{
            backgroundColor: "#fbf7f1",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #e7ded0",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#a15c2e" }}>
              Toạ độ chuẩn hoá (0.00 – 1.00)
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px",
            }}
          >
            <Input
              label="X (Tâm ngang 0–1):"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={slot.normX}
              onChange={handleCoordChange("normX", 0, 1)}
            />

            <Input
              label="Y (Tâm dọc 0–1):"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={slot.normY}
              onChange={handleCoordChange("normY", 0, 1)}
            />

            <Input
              label="Rộng W (0.05–1.0):"
              type="number"
              min="0.05"
              max="1.0"
              step="0.05"
              value={slot.normWidth ?? 0.2}
              onChange={handleCoordChange("normWidth", 0.05, 1.0)}
            />

            <Input
              label="Cao H (0.05–1.0):"
              type="number"
              min="0.05"
              max="1.0"
              step="0.05"
              value={slot.normHeight ?? 0.2}
              onChange={handleCoordChange("normHeight", 0.05, 1.0)}
            />
          </div>
        </div>
      )}
    </>
  );
};
