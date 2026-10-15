import React from "react";
import { SlotDefinition, SlotType, Asset, SlotConfig } from "../../types";
import type { MaterialItem } from "../../../../lib/types";
import { Input, Select } from "../../../../components/ui";
import { TextAssetCustomizer } from "../customer/TextAssetCustomizer";
import { CurtainColorFilterControl } from "../shared/CurtainColorFilterControl";
import { MaterialPickerForSlot } from "./MaterialPickerForSlot";

export interface SlotPropertiesProps {
  slot: SlotDefinition | null;
  slotConfig?: SlotConfig;
  mode?: "admin" | "customer";
  onUpdate: (slotId: string, patch: Partial<SlotDefinition>) => void;
  onDelete?: (slotId: string) => void;
  onAddAsset?: (
    asset: Omit<Asset, "id">,
    assignToCurrentSlot?: boolean,
  ) => void;
  onAssignMaterial?: (material: MaterialItem, slot: SlotDefinition) => void;
  onAssignColor?: (
    slotKey: string,
    hex: string,
    filterMode?: "multiply_blend" | "flat_tint" | "color_map",
    saturation?: number,
  ) => void;
}

const SLOT_TYPE_OPTIONS = [
  { value: "drape", label: "Rèm nền (fabric / drape)" },
  { value: "drape_detail", label: "Rèm chi tiết (drape_detail)" },
  { value: "flower", label: "Cụm hoa (flowers)" },
  { value: "text_name", label: "Dãy chữ số (text_name)" },
];

const friendlyTypeLabel: Record<string, string> = {
  drape: "Rèm nền",
  drape_detail: "Lụa vắt mềm",
  flower: "Cụm hoa trang trí",
  text_name: "Tên dâu rể",
  text_date: "Ngày cưới",
};

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

export const SlotProperties: React.FC<SlotPropertiesProps> = ({
  slot,
  slotConfig = {},
  mode = "admin",
  onUpdate,
  onDelete,
  onAddAsset,
  onAssignMaterial,
  onAssignColor,
}) => {
  const isCustomer = mode === "customer";

  const handleCoordChange = (
    field: "normX" | "normY" | "normWidth" | "normHeight",
    min: number,
    max: number,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!slot) return;
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onUpdate(slot.id, { [field]: Math.max(min, Math.min(max, val)) });
    }
  };

  const renderAlignButton = (
    title: string,
    label: string,
    patch: Partial<SlotDefinition>,
  ) => {
    if (!slot) return null;
    return (
      <button
        type="button"
        title={title}
        onClick={() => onUpdate(slot.id, patch)}
        style={alignBtnStyle}
      >
        {label}
      </button>
    );
  };

  const renderCheckbox = (
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
  ) => (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        color: "#271620",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );

  if (!slot) {
    return (
      <div
        style={{
          padding: "24px",
          color: "#6e6259",
          fontSize: "14px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: "8px",
        }}
      >
        <p style={{ margin: 0, fontWeight: "600", color: "#271620" }}>
          {isCustomer ? "Chưa chọn vị trí trang trí nào" : "Chưa chọn Slot neo nào"}
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: "#9c9186" }}>
          {isCustomer
            ? "Nhấp vào một vị trí trên phông cưới hoặc danh sách bên trái để chọn phối màu và hoa."
            : "Nhấp vào một Slot trên Canvas hoặc danh sách bên trái để chỉnh sửa toạ độ, vật liệu và kích thước."}
        </p>
      </div>
    );
  }

  const handleDeleteClick = () => {
    if (!onDelete) return;
    const isConfirmed = window.confirm(
      isCustomer
        ? `Bạn có chắc muốn xoá vị trí "${slot.label}" này khỏi phông cưới?`
        : `Bạn có chắc chắn muốn xoá Slot '${slot.label || slot.slotKey}'? Thao tác này sẽ xoá luôn các Rule liên quan.`
    );
    if (isConfirmed) {
      onDelete(slot.id);
    }
  };

  return (
    <div
      className="custom-scroll"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px 16px 32px 16px",
        color: "#271620",
        flex: 1,
        minHeight: 0,
        height: "100%",
        overflowY: "auto",
        overscrollBehavior: "contain",
      }}
    >
      {/* Header Slot Info */}
      <div style={{ borderBottom: "1px solid #e7ded0", paddingBottom: "12px" }}>
        {isCustomer ? (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "15px", fontWeight: "700", color: "#271620" }}>
                {slot.label}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  backgroundColor: "#f4eee3",
                  color: "#a15c2e",
                  padding: "3px 10px",
                  borderRadius: "9999px",
                  fontWeight: "700",
                }}
              >
                {friendlyTypeLabel[slot.slotType] || slot.slotType}
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "#6e6259", margin: "4px 0 0" }}>
              Tùy chỉnh chất liệu, dải màu và phối cảnh chi tiết
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontFamily: "monospace",
                backgroundColor: "#f1e4d8",
                color: "#a15c2e",
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(161, 92, 46, 0.2)",
                fontWeight: "700",
              }}
            >
              KEY: {slot.slotKey}
            </span>
            <span style={{ fontSize: "12px", color: "#6e6259", fontWeight: "600" }}>
              Thứ tự: #{slot.sortOrder}
            </span>
          </div>
        )}
      </div>

      {/* Admin Only: Label Edit & Slot Type */}
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
              onChange={(e) =>
                onUpdate(slot.id, { slotType: e.target.value as SlotType })
              }
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
          {renderAlignButton(
            "Căn giữa trục ngang (X = 0.50)",
            "↔ Căn Giữa Ngang",
            { normX: 0.5 },
          )}
          {renderAlignButton(
            "Căn giữa trục dọc (Y = 0.50)",
            "↕ Căn Giữa Dọc",
            { normY: 0.5 },
          )}
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
            <span
              style={{ fontSize: "12px", fontWeight: "700", color: "#a15c2e" }}
            >
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

      {/* Material Picker for Selected Slot (Select from Database) */}
      {onAssignMaterial && (
        <MaterialPickerForSlot
          slot={slot}
          onAssignMaterial={onAssignMaterial}
        />
      )}

      {/* Embedded Live Text Customizer in Panel */}
      {(slot.slotType === "text_name" || slot.slotType === "text_date") &&
        onAddAsset && (
          <div>
            <TextAssetCustomizer
              key={`text-customizer-${slot.id}-${slot.slotKey}`}
              existingAsset={
                slotConfig[slot.slotKey]?.customAsset ||
                slotConfig[slot.slotKey]?.asset ||
                slotConfig[slot.id]?.customAsset ||
                slotConfig[slot.id]?.asset
              }
              onApply={(customAsset) => onAddAsset(customAsset, true)}
            />
          </div>
        )}

      {/* Curtain Color Picker & Filter Control for Active Drape Asset */}
      {(slot.slotType === "drape" || slot.slotType === "drape_detail") && (
        <CurtainColorFilterControl
          slotLabel={slot.label}
          currentColorOverride={
            slotConfig[slot.slotKey]?.colorOverride || "#991B1B"
          }
          currentFilterMode={
            slotConfig[slot.slotKey]?.filterMode || "multiply_blend"
          }
          currentColorSaturation={slotConfig[slot.slotKey]?.colorSaturation}
          onApplyColor={(hex, filterMode, saturation) => {
            if (onAssignColor) {
              onAssignColor(slot.slotKey, hex, filterMode, saturation);
            }
          }}
        />
      )}

      {/* Admin Only: Advanced Checkboxes & Z-Index & Delete */}
      {!isCustomer && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {renderCheckbox("Slot bắt buộc", Boolean(slot.required), (required) =>
              onUpdate(slot.id, { required }),
            )}
            {renderCheckbox("Cho phép thu phóng", Boolean(slot.allowScale), (allowScale) =>
              onUpdate(slot.id, { allowScale }),
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            <Input
              label="Z-Index (0-10)"
              type="number"
              min="0"
              max="10"
              value={slot.zIndex}
              onChange={(e) =>
                onUpdate(slot.id, { zIndex: parseInt(e.target.value) || 0 })
              }
            />

            <Input
              label="Sort Order"
              type="number"
              value={slot.sortOrder}
              onChange={(e) =>
                onUpdate(slot.id, { sortOrder: parseInt(e.target.value) || 0 })
              }
            />
          </div>
        </>
      )}

      {/* Delete Slot Button (Available for both Admin & Customer) */}
      {onDelete && (
        <div
          style={{
            marginTop: "16px",
            paddingTop: "16px",
            paddingBottom: "16px",
            borderTop: "1px solid #e7ded0",
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleDeleteClick}
            style={{
              width: "100%",
              padding: "11px",
              backgroundColor: "#faebea",
              border: "1.5px solid #b4586b",
              borderRadius: "8px",
              color: "#b4586b",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 2px 6px rgba(180, 88, 107, 0.12)",
            }}
          >
            {isCustomer ? `Xoá "${slot.label}" khỏi phông` : "Xoá slot này"}
          </button>
        </div>
      )}
    </div>
  );
};
