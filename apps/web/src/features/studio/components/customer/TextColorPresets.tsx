import React from "react";
import { COLOR_PRESETS } from "../../utils/weddingTextSvgUtils";

export type ColorPreset = (typeof COLOR_PRESETS)[number];

interface TextColorPresetsProps {
  selectedColor: ColorPreset;
  onSelectColor: (color: ColorPreset) => void;
}

export const TextColorPresets: React.FC<TextColorPresetsProps> = ({
  selectedColor,
  onSelectColor,
}) => {
  return (
    <div>
      <label
        style={{
          fontSize: "11px",
          color: "#6e6259",
          fontWeight: "600",
          display: "block",
          marginBottom: "6px",
        }}
      >
        Phối Màu &amp; Hiệu Ứng 3D Ánh Kim:
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px" }}>
        {COLOR_PRESETS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectColor(c)}
            style={{
              padding: "8px 10px",
              fontSize: "11px",
              fontWeight: "600",
              border: selectedColor.id === c.id ? "2px solid #a15c2e" : "1px solid #e7ded0",
              borderRadius: "8px",
              backgroundColor: selectedColor.id === c.id ? "#fdf7f5" : "#fbf7f1",
              color: "#271620",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: selectedColor.id === c.id ? "0 2px 6px rgba(161, 92, 46, 0.12)" : "none",
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
};
