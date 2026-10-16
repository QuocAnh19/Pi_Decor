import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { SlotDefinition, SlotConfig } from "../../types";
import { SlotListItem } from "./SlotListItem";

export interface SlotListProps {
  slots: SlotDefinition[];
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
  onAddSlot?: () => void;
  mode?: "admin" | "customer";
  slotConfig?: SlotConfig;
}

export const SlotList: React.FC<SlotListProps> = ({
  slots,
  selectedSlotId,
  onSelect,
  onAddSlot,
  mode = "admin",
  slotConfig = {},
}) => {
  const isCustomer = mode === "customer";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e7ded0",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(39, 22, 32, 0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e7ded0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#271620",
              margin: 0,
            }}
          >
            {isCustomer ? "Vị trí trang trí" : "Danh sách slot"} ({slots.length})
          </h3>
          {isCustomer && (
            <p style={{ fontSize: "11px", color: "#6e6259", margin: "2px 0 0" }}>
              Chọn vị trí để phối màu và hoa
            </p>
          )}
        </div>

        {onAddSlot && (
          <button
            onClick={onAddSlot}
            style={{
              padding: "6px 12px",
              backgroundColor: "#a15c2e",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              boxShadow: "0 2px 6px rgba(161, 92, 46, 0.25)",
              transition: "all 0.15s ease",
            }}
          >
            <PlusIcon style={{ width: "14px", height: "14px" }} />
            {isCustomer ? "Thêm Vị Trí" : "Thêm Slot"}
          </button>
        )}
      </div>

      {/* Slots List */}
      <div
        className="custom-scroll"
        style={{
          padding: "12px",
          overflowY: "auto",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          overscrollBehavior: "contain",
        }}
      >
        {slots.map((slot) => (
          <SlotListItem
            key={slot.id}
            slot={slot}
            isSelected={slot.id === selectedSlotId}
            isCustomer={isCustomer}
            slotConfig={slotConfig}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};
