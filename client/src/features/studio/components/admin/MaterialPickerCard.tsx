import React from "react";
import type { MaterialItem } from "../../../../lib/types";
import type { SlotDefinition } from "../../types";

interface MaterialPickerCardProps {
  material: MaterialItem;
  slot: SlotDefinition;
  onAssignMaterial: (material: MaterialItem, slot: SlotDefinition) => void;
}

/**
 * Thẻ hiển thị một vật liệu trong bộ chọn vật liệu của Slot.
 */
export const MaterialPickerCard: React.FC<MaterialPickerCardProps> = ({
  material,
  slot,
  onAssignMaterial,
}) => {
  return (
    <div
      onClick={() => onAssignMaterial(material, slot)}
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
        {material.image_url ? (
          <img
            src={material.image_url}
            alt={material.name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : material.color_hex ? (
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: material.color_hex,
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
        {material.name}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAssignMaterial(material, slot);
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
  );
};
