import React from "react";
import { useNavigate } from "react-router-dom";
import { SlotDefinition, SlotConfig, SlotRule } from "../../types";
import type { Lead } from "../../../../lib/types";
import { useCustomerEditor } from "../../hooks/useCustomerEditor";

import { EditorHeader } from "../admin/EditorHeader";
import { SlotList } from "../admin/SlotList";
import { EditorCanvasFrame } from "../shared/EditorCanvasFrame";
import { AddSlotModal } from "../admin/AddSlotModal";
import { SaveDesignModal } from "./SaveDesignModal";

export interface CustomerEditorProps {
  templateId?: string;
  overrideSlots?: SlotDefinition[];
  overrideSlotConfig?: SlotConfig;
  overrideRules?: SlotRule[];
  editingLead?: Lead | null;
  onBackToGallery?: () => void;
}

export const CustomerEditor: React.FC<CustomerEditorProps> = ({
  templateId = "tpl-classic-01",
  overrideSlots,
  overrideSlotConfig,
  editingLead,
  onBackToGallery,
}) => {
  const navigate = useNavigate();
  const {
    template,
    allTemplates,
    slots,
    slotConfig,
    selectedSlotId,
    setSelectedSlotId,
    showGrid,
    setShowGrid,
    isSaveModalOpen,
    setIsSaveModalOpen,
    isAddSlotModalOpen,
    setIsAddSlotModalOpen,
    toastMessage,
    handleSelectTemplate,
    handleSlotPositionChange,
    handleSlotUpdate,
    handleSlotAddSubmit,
    handleDeleteSlot,
    handleMaterialAssign,
    handleColorHexChange,
    handleAddCustomAsset,
    handleReset,
    handleAdminSaveLeadDesign,
  } = useCustomerEditor({
    templateId,
    overrideSlots,
    overrideSlotConfig,
    editingLead,
  });

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || null;

  return (
    <EditorCanvasFrame
      toastMessage={toastMessage}
      header={
        <EditorHeader
          template={template}
          allTemplates={allTemplates}
          isDirty={false}
          showGrid={showGrid}
          mode="customer"
          editingLead={editingLead}
          onBackToHome={onBackToGallery}
          onSelectTemplate={handleSelectTemplate}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onSaveDesign={() => setIsSaveModalOpen(true)}
          onReset={handleReset}
          onAdminSaveLeadDesign={handleAdminSaveLeadDesign}
          onBackToLeads={() => navigate("/admin/leads")}
        />
      }
      leftPanel={
        <div
          style={{
            height: "calc(100vh - 100px)",
            maxHeight: "calc(100vh - 100px)",
          }}
        >
          <SlotList
            slots={slots}
            selectedSlotId={selectedSlotId}
            onSelect={(id) => setSelectedSlotId(id)}
            onAddSlot={() => setIsAddSlotModalOpen(true)}
            mode="customer"
            slotConfig={slotConfig}
          />
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
        mode: "customer",
        onUpdate: handleSlotUpdate,
        onDelete: handleDeleteSlot,
        onAssignMaterial: (mat, slot) => handleMaterialAssign(slot.slotKey, mat),
        onAssignColor: handleColorHexChange,
        onAddAsset: handleAddCustomAsset,
      }}
      modals={
        <>
          <AddSlotModal
            isOpen={isAddSlotModalOpen}
            onClose={() => setIsAddSlotModalOpen(false)}
            onAdd={handleSlotAddSubmit}
            existingSlots={slots}
            existingSlotKeys={slots.map((s) => s.slotKey)}
            mode="customer"
          />
          <SaveDesignModal
            isOpen={isSaveModalOpen}
            onClose={() => setIsSaveModalOpen(false)}
            slotConfig={slotConfig}
            templateId={template.id}
            templateName={template.name}
            slots={slots}
          />
        </>
      }
    />
  );
};
