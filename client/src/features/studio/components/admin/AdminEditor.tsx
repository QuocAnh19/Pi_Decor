import React from "react";
import { useAdminEditor } from "../../hooks/useAdminEditor";
import { EditorHeader } from "./EditorHeader";
import { EditorCanvasFrame } from "../shared/EditorCanvasFrame";
import { SlotList } from "./SlotList";
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
    handleAddCustomAsset,
    handleUpdateTemplateName,
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
    <EditorCanvasFrame
      toastMessage={toastMessage}
      header={
        <EditorHeader
          template={template}
          allTemplates={allTemplates}
          isDirty={isDirty}
          showGrid={showGrid}
          onBackToHome={onBackToHome}
          onSelectTemplate={handleSelectTemplate}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onToggleActive={handleToggleActive}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onUpdateTemplateName={handleUpdateTemplateName}
        />
      }
      leftPanel={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            height: "calc(100vh - 100px)",
            maxHeight: "calc(100vh - 100px)",
            position: "sticky",
            top: "16px",
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <TemplateUploader onUploadBase={handleSvgUpload} />
          </div>

          <div
            style={{
              display: "flex",
              backgroundColor: "#ffffff",
              padding: "4px",
              borderRadius: "8px",
              border: "1px solid #e7ded0",
              flexShrink: 0,
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
                backgroundColor: activeTab === "slots" ? "#a15c2e" : "transparent",
                color: activeTab === "slots" ? "#ffffff" : "#6e6259",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
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
                backgroundColor: activeTab === "rules" ? "#a15c2e" : "transparent",
                color: activeTab === "rules" ? "#ffffff" : "#6e6259",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Rules
            </button>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
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
      }
      canvas={{
        template,
        slots,
        slotConfig,
        selectedSlotId,
        showGrid,
        onSlotSelect: setSelectedSlotId,
        onSlotMove: handleSlotPositionChange,
        onSlotUpdate: handleSlotUpdate,
      }}
      slotProperties={{
        slot: selectedSlot,
        slotConfig,
        onUpdate: handleSlotUpdate,
        onDelete: handleDeleteSlot,
        onAssignMaterial: (mat, slot) => handleMaterialAssign(slot.slotKey, mat),
        onAssignColor: handleColorHexChange,
        onAddAsset: handleAddCustomAsset,
      }}
      modals={
        <AddSlotModal
          isOpen={isAddSlotOpen}
          onClose={() => setIsAddSlotOpen(false)}
          onAdd={handleSlotAddSubmit}
          existingSlots={slots}
          existingSlotKeys={slots.map((s) => s.slotKey)}
          initialNormPos={initialClickNorm}
        />
      }
    />
  );
};
