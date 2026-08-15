import React from "react";
import { SlotDefinition, SlotConfig } from "../../types";
import {
  SwatchIcon,
  SparklesIcon,
  PhotoIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  Square2StackIcon,
  CheckCircleIcon,
  PlusIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export interface SlotListProps {
  slots: SlotDefinition[];
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
  onAddSlot?: () => void;
  mode?: "admin" | "customer";
  slotConfig?: SlotConfig;
}

const friendlyTypeLabel: Record<string, string> = {
  drape: "Rèm nền",
  drape_detail: "Lụa vắt",
  flower: "Cụm hoa",
  text_name: "Bảng tên",
  text_date: "Ngày cưới",
};

const getSlotTypeIcon = (type: string, isSelected: boolean) => {
  const iconStyle = {
    width: "15px",
    height: "15px",
    flexShrink: 0,
    color: isSelected ? "#a15c2e" : "#8b7e74",
  };

  switch (type) {
    case "drape":
      return <SwatchIcon style={iconStyle} />;
    case "drape_detail":
      return <SparklesIcon style={iconStyle} />;
    case "flower":
      return <PhotoIcon style={iconStyle} />;
    case "text_name":
      return <PencilSquareIcon style={iconStyle} />;
    case "text_date":
      return <CalendarDaysIcon style={iconStyle} />;
    default:
      return <Square2StackIcon style={iconStyle} />;
  }
};

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
            <p
              style={{ fontSize: "11px", color: "#6e6259", margin: "2px 0 0" }}
            >
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
        {slots.map((slot) => {
          const isSelected = slot.id === selectedSlotId;
          const currentConfig = slotConfig[slot.slotKey] || slotConfig[slot.id];
          const hasColor = Boolean(currentConfig?.colorOverride);
          const hasAsset = Boolean(
            currentConfig?.assetId ||
            currentConfig?.asset ||
            currentConfig?.customAsset ||
            currentConfig?.materialImage
          );

          return (
            <div
              key={slot.id}
              onClick={() => onSelect(slot.id)}
              style={{
                padding: "10px 12px",
                backgroundColor: isSelected ? "#fdf7f5" : "#fbf7f1",
                border: `1.5px solid ${isSelected ? "#a15c2e" : "#e7ded0"}`,
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                transition: "all 0.15s ease",
                boxShadow: isSelected
                  ? "0 2px 8px rgba(161, 92, 46, 0.12)"
                  : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div style={{ marginTop: "2px" }}>
                  {getSlotTypeIcon(slot.slotType, isSelected)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: isSelected ? "#a15c2e" : "#271620",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {!isCustomer && slot.required && (
                      <StarIcon
                        style={{
                          width: "13px",
                          height: "13px",
                          color: "#b98a3e",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {slot.label}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6e6259",
                      marginTop: "2px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {isCustomer ? (
                      hasColor ? (
                        <>
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: currentConfig?.colorOverride,
                              border: "1px solid rgba(0,0,0,0.15)",
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: "#a15c2e", fontWeight: "600" }}>
                            Đã chọn màu sắc
                          </span>
                        </>
                      ) : hasAsset ? (
                        <>
                          <CheckCircleIcon
                            style={{
                              width: "12px",
                              height: "12px",
                              color: "#47663b",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: "#47663b", fontWeight: "600" }}>
                            Đã chọn mẫu
                          </span>
                        </>
                      ) : (
                        <>
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              backgroundColor: "#c5bbae",
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: "#9c9186" }}>
                            Chạm để phối mẫu
                          </span>
                        </>
                      )
                    ) : (
                      <span style={{ fontFamily: "monospace" }}>
                        {slot.slotKey} • ({slot.normX.toFixed(2)},{" "}
                        {slot.normY.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: "10px",
                  backgroundColor: isSelected ? "#f6e4d8" : "#f4eee3",
                  color: isSelected ? "#a15c2e" : "#6e6259",
                  border: "1px solid #e7ded0",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  fontWeight: "600",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {friendlyTypeLabel[slot.slotType] || slot.slotType}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
