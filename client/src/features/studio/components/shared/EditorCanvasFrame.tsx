import React, { ReactNode } from "react";
import type { Template, SlotDefinition, SlotConfig } from "../../types";
import { AdminCanvas } from "../admin/AdminCanvas";
import { SlotProperties, SlotPropertiesProps } from "../admin/SlotProperties";

export interface EditorCanvasFrameProps {
  toastMessage?: string | null;
  header: ReactNode;
  leftPanel: ReactNode;
  canvas?: {
    template: Template;
    slots: SlotDefinition[];
    slotConfig: SlotConfig;
    selectedSlotId: string | null;
    showGrid: boolean;
    onSlotSelect: (id: string) => void;
    onSlotMove: (id: string, x: number, y: number) => void;
    onSlotUpdate: (slotId: string, patch: Partial<SlotDefinition>) => void;
  };
  centerCanvas?: ReactNode;
  slotProperties?: SlotPropertiesProps;
  rightPanel?: ReactNode;
  modals?: ReactNode;
}

/**
 * Khung layout chuẩn 3 cột cho Studio Editor (dùng chung cho cả AdminEditor và CustomerEditor).
 * Đóng gói khung hiển thị, thông báo toast nổi, cột trái, khung canvas tương tác ở giữa,
 * và panel thuộc tính slot dính (sticky) ở bên phải.
 */
export const EditorCanvasFrame: React.FC<EditorCanvasFrameProps> = ({
  toastMessage,
  header,
  leftPanel,
  canvas,
  centerCanvas,
  slotProperties,
  rightPanel,
  modals,
}) => {
  return (
    <div
      className="no-scrollbar"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f4eee3",
        color: "#271620",
        padding: "16px 24px",
        gap: "16px",
        boxSizing: "border-box",
      }}
    >
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            maxWidth: "380px",
            backgroundColor: "#271620",
            color: "#fbf7f1",
            border: "1px solid #a15c2e",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "13px",
            fontWeight: "600",
            boxShadow: "0 10px 25px rgba(39, 22, 32, 0.2)",
            zIndex: 9999,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            pointerEvents: "none",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header Controls */}
      {header}

      {/* Main 3-Column Studio Workspace */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr 340px",
          gap: "20px",
          flex: 1,
          alignItems: "start",
        }}
      >
        {/* Left Column */}
        {leftPanel}

        {/* Middle Column: Interactive SVG Canvas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ flex: 1, minHeight: "520px" }}>
            {canvas ? (
              <AdminCanvas
                template={canvas.template}
                slots={canvas.slots}
                slotConfig={canvas.slotConfig}
                selectedSlotId={canvas.selectedSlotId}
                showGrid={canvas.showGrid}
                onSlotSelect={canvas.onSlotSelect}
                onSlotMove={canvas.onSlotMove}
                onSlotUpdate={canvas.onSlotUpdate}
              />
            ) : (
              centerCanvas
            )}
          </div>
        </div>

        {/* Right Column: Slot Properties Panel Container */}
        <div
          style={{
            position: "sticky",
            top: "16px",
            height: "calc(100vh - 100px)",
            maxHeight: "calc(100vh - 100px)",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e7ded0",
            boxShadow: "0 4px 16px rgba(39, 22, 32, 0.04)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {slotProperties ? <SlotProperties {...slotProperties} /> : rightPanel}
        </div>
      </div>

      {modals}
    </div>
  );
};
