import React, { useState, useEffect, useRef } from "react";
import { Asset } from "../../types";
import {
  EVENT_TITLES,
  ARTISTIC_FONTS,
  COLOR_PRESETS,
  type LineSettings,
  generateCustomWeddingSVG,
  parseWeddingInfo,
} from "../../utils/weddingTextSvgUtils";
import { TextLineInspector } from "./TextLineInspector";
import { EventTitleSelector } from "./EventTitleSelector";
import { LineTabSelector } from "./LineTabSelector";
import { TextColorPresets } from "./TextColorPresets";

export {
  EVENT_TITLES,
  ARTISTIC_FONTS,
  COLOR_PRESETS,
  type LineSettings,
  generateCustomWeddingSVG,
  parseWeddingInfo,
};

export interface TextAssetCustomizerProps {
  onApply: (asset: Asset) => void;
  existingAsset?: Asset | null;
  initialTitle?: string;
  initialBride?: string;
  initialGroom?: string;
  initialDate?: string;
}

export const TextAssetCustomizer: React.FC<TextAssetCustomizerProps> = ({
  onApply,
  existingAsset,
  initialTitle = "LỄ VU QUY",
  initialBride = "Phương Anh",
  initialGroom = "Đức Dũng",
  initialDate = "19 • 03 • 2026",
}) => {
  const parsed = parseWeddingInfo(existingAsset);
  const [activeLineTab, setActiveLineTab] = useState<1 | 2 | 3 | 4>(2);

  const [line1, setLine1] = useState<LineSettings>({
    text: parsed?.title || initialTitle,
    fontFamily: ARTISTIC_FONTS[6].family,
    fontSize: 20,
    letterSpacing: "0.18em",
    posY: parsed?.y1 ?? 55,
    posX: parsed?.x1 ?? 300,
  });

  const [line2, setLine2] = useState<LineSettings>({
    text: parsed?.bride || initialBride,
    fontFamily: ARTISTIC_FONTS[0].family,
    fontSize: 76,
    letterSpacing: "0em",
    posY: parsed?.y2 ?? 160,
    posX: parsed?.x2 ?? 300,
  });

  const [line3, setLine3] = useState<LineSettings>({
    text: parsed?.groom || initialGroom,
    fontFamily: ARTISTIC_FONTS[0].family,
    fontSize: 76,
    letterSpacing: "0em",
    posY: parsed?.y3 ?? 275,
    posX: parsed?.x3 ?? 300,
  });

  const [line4, setLine4] = useState<LineSettings>({
    text: parsed?.date || initialDate,
    fontFamily: ARTISTIC_FONTS[9].family,
    fontSize: 18,
    letterSpacing: "0.25em",
    posY: parsed?.y4 ?? 365,
    posX: parsed?.x4 ?? 300,
  });

  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const hasUserEdited = useRef(false);
  const onApplyRef = useRef(onApply);

  useEffect(() => {
    onApplyRef.current = onApply;
  }, [onApply]);

  useEffect(() => {
    const currentParsed = parseWeddingInfo(existingAsset);
    if (currentParsed && !hasUserEdited.current) {
      if (currentParsed.title) {
        setLine1((prev) => ({
          ...prev,
          text: currentParsed.title!,
          posY: currentParsed.y1,
          posX: currentParsed.x1,
        }));
      }
      if (currentParsed.bride) {
        setLine2((prev) => ({
          ...prev,
          text: currentParsed.bride!,
          posY: currentParsed.y2,
          posX: currentParsed.x2,
        }));
      }
      if (currentParsed.groom) {
        setLine3((prev) => ({
          ...prev,
          text: currentParsed.groom!,
          posY: currentParsed.y3,
          posX: currentParsed.x3,
        }));
      }
      if (currentParsed.date) {
        setLine4((prev) => ({
          ...prev,
          text: currentParsed.date!,
          posY: currentParsed.y4,
          posX: currentParsed.x4,
        }));
      }
    }
  }, [existingAsset]);

  useEffect(() => {
    if (!hasUserEdited.current) return;

    const svgData = generateCustomWeddingSVG({
      line1,
      line2,
      line3,
      line4,
      colorPreset: selectedColor,
    });

    const customAsset: Asset = {
      id: "asset-text-custom-live",
      assetType: "text_name",
      name: `${line1.text}: ${line2.text} & ${line3.text}`,
      colorHex: selectedColor.grad4,
      fontFamily: line2.fontFamily,
      tags: ["custom-artistic-text", line1.text.toLowerCase().replace(/\s+/g, "-")],
      isActive: true,
      svgData,
    };

    onApplyRef.current(customAsset);
  }, [line1, line2, line3, line4, selectedColor]);

  const getActiveLineData = () => {
    switch (activeLineTab) {
      case 1:
        return { data: line1, set: setLine1, title: "Dòng 1: Tên Lễ" };
      case 2:
        return { data: line2, set: setLine2, title: "Dòng 2: Tên Cô Dâu" };
      case 3:
        return { data: line3, set: setLine3, title: "Dòng 3: Tên Chú Rể" };
      case 4:
        return { data: line4, set: setLine4, title: "Dòng 4: Ngày Tháng" };
    }
  };

  const activeLine = getActiveLineData();

  const handleFontFamilyChange = (newFont: string) => {
    hasUserEdited.current = true;
    if (activeLineTab === 2 || activeLineTab === 3) {
      setLine2((prev) => ({ ...prev, fontFamily: newFont }));
      setLine3((prev) => ({ ...prev, fontFamily: newFont }));
    } else if (activeLineTab === 1) {
      setLine1((prev) => ({ ...prev, fontFamily: newFont }));
    } else if (activeLineTab === 4) {
      setLine4((prev) => ({ ...prev, fontFamily: newFont }));
    }
  };

  const handlePatchActiveLine = (patch: Partial<LineSettings>) => {
    hasUserEdited.current = true;
    activeLine.set((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e7ded0",
        borderRadius: "16px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 4px 16px rgba(39, 22, 32, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e7ded0",
          paddingBottom: "10px",
        }}
      >
        <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#271620", margin: 0 }}>
          Tùy Chỉnh Chữ &amp; Font Từng Dòng
        </h4>
        <span
          style={{
            fontSize: "10px",
            backgroundColor: "#f1e4d8",
            color: "#a15c2e",
            border: "1px solid rgba(161, 92, 46, 0.3)",
            padding: "2px 8px",
            borderRadius: "12px",
            fontWeight: "700",
          }}
        >
          Live Customizer
        </span>
      </div>

      <EventTitleSelector
        currentTitle={line1.text}
        onSelectTitle={(t) => {
          hasUserEdited.current = true;
          setLine1((prev) => ({ ...prev, text: t }));
          setActiveLineTab(1);
        }}
      />

      <LineTabSelector activeLineTab={activeLineTab} onSelectTab={setActiveLineTab} />

      <TextLineInspector
        activeLineTab={activeLineTab}
        activeLineTitle={activeLine.title}
        activeLineData={activeLine.data}
        onPatchActiveLine={handlePatchActiveLine}
        onFontFamilyChange={handleFontFamilyChange}
      />

      <TextColorPresets
        selectedColor={selectedColor}
        onSelectColor={(c) => {
          hasUserEdited.current = true;
          setSelectedColor(c);
        }}
      />
    </div>
  );
};
