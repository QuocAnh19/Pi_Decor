import React from "react";
import { Input, Select } from "../../../../components/ui";
import {
  ARTISTIC_FONTS,
  type LineSettings,
} from "../../utils/weddingTextSvgUtils";

interface TextLineInspectorProps {
  activeLineTab: 1 | 2 | 3 | 4;
  activeLineTitle: string;
  activeLineData: LineSettings;
  onPatchActiveLine: (patch: Partial<LineSettings>) => void;
  onFontFamilyChange: (newFont: string) => void;
}

/**
 * Bộ điều khiển chi tiết (nội dung, font, vị trí X/Y, cỡ chữ, khoảng cách chữ) cho dòng chữ đang chọn.
 */
export const TextLineInspector: React.FC<TextLineInspectorProps> = ({
  activeLineTab,
  activeLineTitle,
  activeLineData,
  onPatchActiveLine,
  onFontFamilyChange,
}) => {
  return (
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
      <div style={{ fontSize: "12px", fontWeight: "700", color: "#271620" }}>
        Điều chỉnh: <span style={{ color: "#a15c2e" }}>{activeLineTitle}</span>
      </div>

      <div>
        <Input
          label="Nội dung chữ:"
          type="text"
          value={activeLineData.text}
          onChange={(e) => onPatchActiveLine({ text: e.target.value })}
        />
      </div>

      <div>
        <Select
          label={
            activeLineTab === 2 || activeLineTab === 3
              ? "Font Chữ Nghệ Thuật (Đồng bộ Cô Dâu & Chú Rể):"
              : "Font Chữ Nghệ Thuật (10 Kiểu Hot):"
          }
          value={activeLineData.fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          options={ARTISTIC_FONTS.map((f) => ({
            value: f.family,
            label: f.name,
          }))}
        />
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2px",
          }}
        >
          <label
            style={{ fontSize: "11px", color: "#a15c2e", fontWeight: "600" }}
          >
            Vị trí Y (Độ cao / Khoảng cách dòng): {activeLineData.posY}px
          </label>
        </div>
        <input
          type="range"
          min="10"
          max="420"
          value={activeLineData.posY}
          onChange={(e) =>
            onPatchActiveLine({ posY: parseInt(e.target.value) || 0 })
          }
          style={{ width: "100%", accentColor: "#a15c2e" }}
        />
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2px",
          }}
        >
          <label style={{ fontSize: "11px", color: "#6e6259" }}>
            Vị trí X (Trái / Phải): {activeLineData.posX}px
          </label>
          <button
            type="button"
            onClick={() => onPatchActiveLine({ posX: 300 })}
            style={{
              padding: "2px 8px",
              fontSize: "10px",
              backgroundColor: "#ffffff",
              color: "#a15c2e",
              border: "1px solid #e7ded0",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Căn Giữa (300)
          </button>
        </div>
        <input
          type="range"
          min="50"
          max="550"
          value={activeLineData.posX}
          onChange={(e) =>
            onPatchActiveLine({ posX: parseInt(e.target.value) || 300 })
          }
          style={{ width: "100%", accentColor: "#a15c2e" }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
        }}
      >
        <div>
          <label
            style={{
              fontSize: "11px",
              color: "#6e6259",
              display: "block",
              marginBottom: "2px",
            }}
          >
            Cỡ chữ (Size: {activeLineData.fontSize}px):
          </label>
          <input
            type="range"
            min="12"
            max="110"
            value={activeLineData.fontSize}
            onChange={(e) =>
              onPatchActiveLine({ fontSize: parseInt(e.target.value) || 20 })
            }
            style={{ width: "100%", accentColor: "#a15c2e" }}
          />
        </div>

        <div>
          <Input
            label="Khoảng cách chữ (Spacing):"
            type="text"
            placeholder="0em hoặc 0.18em"
            value={activeLineData.letterSpacing}
            onChange={(e) =>
              onPatchActiveLine({ letterSpacing: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};
