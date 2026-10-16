import React, { useState } from "react";
import { Input } from "../../../../components/ui";
import { CurtainColorPresetsGrid } from "./CurtainColorPresetsGrid";

export interface CurtainColorFilterControlProps {
  slotLabel?: string;
  currentColorOverride?: string;
  currentFilterMode?: "multiply_blend" | "flat_tint" | "color_map";
  currentColorSaturation?: number;
  onApplyColor: (
    hex: string,
    filterMode?: "multiply_blend" | "flat_tint" | "color_map",
    saturation?: number,
  ) => void;
}

export const CurtainColorFilterControl: React.FC<
  CurtainColorFilterControlProps
> = ({
  slotLabel = "Rèm",
  currentColorOverride = "#991B1B",
  currentFilterMode = "multiply_blend",
  currentColorSaturation = 100,
  onApplyColor,
}) => {
  const [customInput, setCustomInput] = useState("");
  const [customColors, setCustomColors] = useState<string[]>([]);
  const filterMode = currentFilterMode;
  const [saturation, setSaturation] = useState<number>(currentColorSaturation);

  const normalizeHex = (hexStr: string): string | null => {
    let clean = hexStr.trim().replace(/^#/, "");
    if (clean.length === 3) {
      clean = clean
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      return `#${clean.toUpperCase()}`;
    }
    return null;
  };

  const handleInputChange = (val: string) => {
    setCustomInput(val);
    const validHex = normalizeHex(val);
    if (validHex) {
      onApplyColor(validHex, filterMode, saturation);
    }
  };

  const handleAddCustomColors = () => {
    if (!customInput.trim()) return;
    const rawTokens = customInput.split(/[,;\s]+/);
    const validHexes: string[] = [];

    for (const token of rawTokens) {
      const valid = normalizeHex(token);
      if (valid) {
        validHexes.push(valid);
      }
    }

    if (validHexes.length > 0) {
      setCustomColors((prev) => [...new Set([...prev, ...validHexes])]);
      setCustomInput("");
      onApplyColor(validHexes[0], filterMode, saturation);
    } else {
      alert(
        "Vui lòng nhập đúng định dạng mã màu hex (vd: #991B1B, #D97706 hoặc 991B1B)",
      );
    }
  };

  const handleRemoveCustomColor = (
    hexToRemove: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setCustomColors((prev) => prev.filter((c) => c !== hexToRemove));
  };

  const handleSaturationChange = (newSat: number) => {
    setSaturation(newSat);
    onApplyColor(currentColorOverride, filterMode, newSat);
  };

  const handleSelectColor = (hex: string) => {
    onApplyColor(hex, filterMode, saturation);
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "16px",
        border: "1px solid #e7ded0",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: "0 4px 16px rgba(39, 22, 32, 0.04)",
      }}
    >
      {/* Title & Active Swatch Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "#271620",
            margin: 0,
          }}
        >
          Bộ Lọc & Đổi Màu Rèm ({slotLabel})
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: currentColorOverride,
              border: "1.5px solid #ffffff",
              boxShadow: "0 0 4px rgba(39, 22, 32, 0.2)",
            }}
          />
          <span
            style={{
              fontSize: "11px",
              fontFamily: "monospace",
              color: "#a15c2e",
              fontWeight: "700",
            }}
          >
            {currentColorOverride.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 1. Custom Color Input Field & Clickable Color Picker */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label
          style={{ fontSize: "11px", fontWeight: "600", color: "#6e6259" }}
        >
          Nhập mã màu tùy chọn (gõ mã hex hoặc chọn từ bảng màu):
        </label>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Ví dụ: #991B1B, #D97706, #1D4ED8..."
              value={customInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCustomColors();
              }}
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              border: "1.5px solid #a15c2e",
              backgroundColor: currentColorOverride,
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(161, 92, 46, 0.2)",
            }}
            title="Nhấp để chọn màu bất kỳ từ bảng màu"
          >
            <input
              type="color"
              value={currentColorOverride}
              onChange={(e) => {
                const hex = e.target.value.toUpperCase();
                handleSelectColor(hex);
              }}
              onBlur={(e) => {
                const hex = e.target.value.toUpperCase();
                if (hex && !customColors.includes(hex)) {
                  setCustomColors((prev) => [...prev, hex]);
                }
              }}
              style={{
                position: "absolute",
                top: "-10px",
                left: "-10px",
                width: "60px",
                height: "60px",
                opacity: 0,
                cursor: "pointer",
              }}
            />
            <span
              style={{
                fontSize: "14px",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
              }}
            >
              🎨
            </span>
          </label>
        </div>
      </div>

      {/* 2. Color Saturation / Intensity Slider */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          backgroundColor: "#fbf7f1",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #e7ded0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <label
            style={{ fontSize: "11px", fontWeight: "700", color: "#a15c2e" }}
          >
            Sắc Độ / Độ Đậm Màu:
          </label>
          <span
            style={{
              fontSize: "11px",
              fontFamily: "monospace",
              fontWeight: "700",
              color: "#271620",
            }}
          >
            {saturation}%
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={200}
          step={5}
          value={saturation}
          onChange={(e) => handleSaturationChange(Number(e.target.value))}
          style={{ width: "100%", cursor: "pointer", accentColor: "#a15c2e" }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "4px",
            marginTop: "4px",
          }}
        >
          {[
            { label: "Nhạt (50%)", val: 50 },
            { label: "Chuẩn (100%)", val: 100 },
            { label: "Đậm (140%)", val: 140 },
            { label: "Rực Rỡ (180%)", val: 180 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => handleSaturationChange(preset.val)}
              style={{
                padding: "5px 2px",
                border:
                  saturation === preset.val
                    ? "1px solid #a15c2e"
                    : "1px solid #e7ded0",
                borderRadius: "6px",
                backgroundColor:
                  saturation === preset.val ? "#a15c2e" : "#ffffff",
                color: saturation === preset.val ? "#ffffff" : "#6e6259",
                fontSize: "10px",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.15s ease",
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3 & 4. Custom & Preset Color Chips */}
      <CurtainColorPresetsGrid
        currentColorOverride={currentColorOverride}
        customColors={customColors}
        onSelectColor={handleSelectColor}
        onRemoveCustomColor={handleRemoveCustomColor}
      />
    </div>
  );
};
