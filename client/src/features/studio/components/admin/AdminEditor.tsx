import React from "react";
import { useAdminEditor } from "../../hooks/useAdminEditor";
import { EditorHeader } from "./EditorHeader";
import { AdminCanvas } from "./AdminCanvas";
import { SlotList } from "./SlotList";
import { SlotProperties } from "./SlotProperties";
import { RuleList } from "./RuleList";
import { AddSlotModal } from "./AddSlotModal";
import { TemplateUploader } from "./TemplateUploader";
import { CustomerEditor } from "../customer/CustomerEditor";

export interface AdminEditorProps {
  templateId?: string;
  onBackToHome?: () => void;
}

export const AdminEditor: React.FC<AdminEditorProps> = ({
  templateId = "tpl-classic-01",
  onBackToHome,
}) => {
  const {
    template,
    slots,
    rules,
    slotConfig,
    allTemplates,
    selectedSlotId,
    setSelectedSlotId,
    showGrid,
    setShowGrid,
    isPreviewMode,
    setIsPreviewMode,
    isDirty,
    isAddSlotOpen,
    setIsAddSlotOpen,
    initialClickNorm,
    toastMessage,
    activeTab,
    setActiveTab,
    handleSelectTemplate,
    handleSaveDraft,
    handlePublish,
    handleToggleActive,
    handleSlotPositionChange,
    handleSlotUpdate,
    handleAddSlotClick,
    handleSlotAddSubmit,
    handleDeleteSlot,
    handleRuleAdd,
    handleRuleUpdate,
    handleRuleDelete,
    handleSvgUpload,
    handleMaterialAssign,
    handleColorHexChange,
  } = useAdminEditor({ templateId });

  if (isPreviewMode) {
    return (
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#e11d48",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "30px",
            fontSize: "13px",
            fontWeight: "700",
            boxShadow: "0 10px 25px -5px rgba(225, 29, 72, 0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span>Đang trong chế độ Preview (Khách Hàng)</span>
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            style={{
              backgroundColor: "#ffffff",
              color: "#e11d48",
              border: "none",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Thoát Preview
          </button>
        </div>

        <CustomerEditor
          templateId={template.id}
          overrideSlots={slots}
          overrideSlotConfig={slotConfig}
          overrideRules={rules}
        />
      </div>
    );
  }

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || null;

  return (
    <div
      className="no-scrollbar"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
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
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            border: "1px solid #38bdf8",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "13px",
            fontWeight: "600",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
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
      <EditorHeader
        template={template}
        allTemplates={allTemplates}
        isDirty={isDirty}
        isPreviewMode={isPreviewMode}
        showGrid={showGrid}
        onBackToHome={onBackToHome}
        onSelectTemplate={handleSelectTemplate}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onToggleActive={handleToggleActive}
        onTogglePreview={() => setIsPreviewMode(true)}
        onToggleGrid={() => setShowGrid(!showGrid)}
      />

      {/* Main Admin 3-Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr 340px",
          gap: "20px",
          flex: 1,
          alignItems: "start",
        }}
      >
        {/* Left Column: Template SVG Upload, Slot & Rule Tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <TemplateUploader onUploadBase={handleSvgUpload} />

          <div
            style={{
              display: "flex",
              backgroundColor: "#1e293b",
              padding: "4px",
              borderRadius: "8px",
              border: "1px solid #334155",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("slots")}
              style={{
                flex: 1,
                padding: "6px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: activeTab === "slots" ? "#e11d48" : "transparent",
                color: activeTab === "slots" ? "#ffffff" : "#94a3b8",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Slots ({slots.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rules")}
              style={{
                flex: 1,
                padding: "6px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: activeTab === "rules" ? "#e11d48" : "transparent",
                color: activeTab === "rules" ? "#ffffff" : "#94a3b8",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Rules 
              {/* ({rules.length}) */}
            </button>
          </div>

          <div style={{ flex: 1 }}>
            {activeTab === "slots" ? (
              <SlotList
                slots={slots}
                selectedSlotId={selectedSlotId}
                onSelect={(id) => setSelectedSlotId(id)}
                onAddSlot={() => handleAddSlotClick()}
              />
            ) : (
              <RuleList
                rules={rules}
                slots={slots}
                onAddRule={handleRuleAdd}
                onUpdateRule={handleRuleUpdate}
                onDeleteRule={handleRuleDelete}
              />
            )}
          </div>
        </div>

        {/* Middle Column: SVG Admin Canvas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ flex: 1, minHeight: "520px" }}>
            <AdminCanvas
              template={template}
              slots={slots}
              slotConfig={slotConfig}
              selectedSlotId={selectedSlotId}
              showGrid={showGrid}
              onSlotSelect={(id) => setSelectedSlotId(id)}
              onSlotMove={(id, x, y) => handleSlotPositionChange(id, x, y)}
              onSlotUpdate={handleSlotUpdate}
            />
          </div>
        </div>

        {/* Right Column: Slot Properties Panel */}
        <div
          style={{
            position: "sticky",
            top: "24px",
            maxHeight: "calc(100vh - 48px)",
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            border: "1px solid #334155",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <SlotProperties
            slot={selectedSlot}
            slotConfig={slotConfig}
            onUpdate={handleSlotUpdate}
            onDelete={(id) => handleDeleteSlot(id)}
            onAssignMaterial={(mat, slot) => handleMaterialAssign(slot.slotKey, mat)}
            onAssignColor={(key, hex, filterMode, saturation) => handleColorHexChange(key, hex, filterMode, saturation)}
          />
        </div>
      </div>

      <AddSlotModal
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        onAdd={handleSlotAddSubmit}
        existingSlots={slots}
        existingSlotKeys={slots.map((s) => s.slotKey)}
        initialNormPos={initialClickNorm}
      />
    </div>
  );
};
