import React from "react";
import { EVENT_TITLES } from "../../utils/weddingTextSvgUtils";

interface EventTitleSelectorProps {
  currentTitle: string;
  onSelectTitle: (title: string) => void;
}

export const EventTitleSelector: React.FC<EventTitleSelectorProps> = ({
  currentTitle,
  onSelectTitle,
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
        Tên Lễ Nhanh (Dòng 1):
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {EVENT_TITLES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onSelectTitle(t)}
            style={{
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "600",
              border: currentTitle === t ? "1px solid #a15c2e" : "1px solid #e7ded0",
              borderRadius: "6px",
              backgroundColor: currentTitle === t ? "#a15c2e" : "#fbf7f1",
              color: currentTitle === t ? "#ffffff" : "#6e6259",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};
