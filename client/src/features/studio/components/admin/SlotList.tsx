import React from "react";
import { SlotDefinition } from "../../types";

export interface SlotListProps {
  slots: SlotDefinition[];
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
  onAddSlot: () => void;
}

export const SlotList: React.FC<SlotListProps> = ({
  slots,
  selectedSlotId,
  onSelect,
  onAddSlot,
}) => {
  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        borderRadius: "12px",
        border: "1px solid #334155",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header & Add Button */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #334155",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#f8fafc" }}>
          Danh Sách Slot ({slots.length})
        </h3>
        <button
          onClick={onAddSlot}
          style={{
            padding: "6px 12px",
            backgroundColor: "#e11d48",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Thêm Slot
        </button>
      </div>

      {/* Slots List */}
      <div
        className="admin-scroll"
        style={{
          padding: "12px",
          overflowY: "auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {slots.map((slot) => {
          const isSelected = slot.id === selectedSlotId;
          return (
            <div
              key={slot.id}
              onClick={() => onSelect(slot.id)}
              style={{
                padding: "10px 12px",
                backgroundColor: isSelected
                  ? "rgba(56, 189, 248, 0.15)"
                  : "#0f172a",
                border: `1px solid ${isSelected ? "#38bdf8" : "#334155"}`,
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.15s ease",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: isSelected ? "#38bdf8" : "#f8fafc",
                  }}
                >
                  {slot.required && (
                    <span style={{ color: "#fbbf24", marginRight: "4px" }}>
                      ⭐
                    </span>
                  )}
                  {slot.label}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    fontFamily: "monospace",
                    marginTop: "2px",
                  }}
                >
                  {slot.slotKey} • ({slot.normX.toFixed(2)},{" "}
                  {slot.normY.toFixed(2)})
                </div>
              </div>

              <span
                style={{
                  fontSize: "10px",
                  backgroundColor: "#334155",
                  color: "#cbd5e1",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {slot.slotType}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
