import React from "react";

interface LineTabSelectorProps {
  activeLineTab: 1 | 2 | 3 | 4;
  onSelectTab: (tab: 1 | 2 | 3 | 4) => void;
}

export const LineTabSelector: React.FC<LineTabSelectorProps> = ({ activeLineTab, onSelectTab }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        backgroundColor: "#f4eee3",
        padding: "4px",
        borderRadius: "8px",
        border: "1px solid #e7ded0",
      }}
    >
      {[
        { id: 1, label: "Dòng 1 (Lễ)" },
        { id: 2, label: "Dòng 2 (Cô Dâu)" },
        { id: 3, label: "Dòng 3 (Chú Rể)" },
        { id: 4, label: "Dòng 4 (Ngày)" },
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelectTab(tab.id as 1 | 2 | 3 | 4)}
          style={{
            flex: 1,
            padding: "6px 2px",
            fontSize: "11px",
            fontWeight: "600",
            border: "none",
            borderRadius: "6px",
            backgroundColor: activeLineTab === tab.id ? "#a15c2e" : "transparent",
            color: activeLineTab === tab.id ? "#ffffff" : "#6e6259",
            cursor: "pointer",
            transition: "all 0.15s ease",
            boxShadow: activeLineTab === tab.id ? "0 1px 3px rgba(161, 92, 46, 0.25)" : "none",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
