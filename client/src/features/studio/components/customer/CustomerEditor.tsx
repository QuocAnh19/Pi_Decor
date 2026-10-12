import React, { useState, useEffect, useCallback } from "react";
import { Template, SlotDefinition, SlotConfig, Asset } from "../../types";
import type { StudioTemplateRow, MaterialItem } from "../../../../lib/types";
import {
  seedTemplates,
  seedSlots,
  seedPublishedSlotConfig,
} from "../../data/seed/templates";
import { toStudioTemplate, toStudioSlot } from "../../utils/adapters";
import { api } from "../../../../lib/api";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../lib/authContext";
import { captureStudioThumbnail, generateBrandedDesignImage } from "../../utils/captureThumbnail";
import type { Lead } from "../../../../lib/types";

import { EditorHeader } from "../admin/EditorHeader";
import { SlotList } from "../admin/SlotList";
import { AdminCanvas } from "../admin/AdminCanvas";
import { SlotProperties } from "../admin/SlotProperties";
import { AddSlotModal } from "../admin/AddSlotModal";
import { SaveDesignModal } from "./SaveDesignModal";

export interface CustomerEditorProps {
  templateId?: string;
  overrideSlots?: SlotDefinition[];
  overrideSlotConfig?: SlotConfig;
  overrideRules?: any[];
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
  const { token } = useAuth();
  const [template, setTemplate] = useState<Template>(
    () => seedTemplates.find((t) => t.id === templateId) || seedTemplates[0]
  );
  const [allTemplates, setAllTemplates] = useState<StudioTemplateRow[]>([]);
  const [slots, setSlots] = useState<SlotDefinition[]>(() => overrideSlots || seedSlots);
  const [slotConfig, setSlotConfig] = useState<SlotConfig>(
    () => overrideSlotConfig || seedPublishedSlotConfig
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    () => (overrideSlots && overrideSlots[0]?.id) || seedSlots[0]?.id || null
  );

  // Store the exact original template, slots, and preset config of the selected template
  const originalTemplateRef = React.useRef<Template>(
    seedTemplates.find((t) => t.id === templateId) || seedTemplates[0]
  );
  const originalSlotsRef = React.useRef<SlotDefinition[]>(overrideSlots || seedSlots);
  const originalConfigRef = React.useRef<SlotConfig>(
    overrideSlotConfig || seedPublishedSlotConfig
  );

  const [showGrid, setShowGrid] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  }, []);

  // Fetch available templates from API
  useEffect(() => {
    api
      .getStudioTemplates()
      .then((rows) => {
        if (Array.isArray(rows) && rows.length > 0) {
          setAllTemplates(rows);
          const matched = rows.find((r) => r.id === templateId);
          if (matched && !overrideSlots) {
            const tpl = toStudioTemplate(matched);
            setTemplate(tpl);
            originalTemplateRef.current = tpl;

            const initialConfig =
              matched.default_config && Object.keys(matched.default_config).length > 0
                ? (matched.default_config as SlotConfig)
                : {};
            setSlotConfig(initialConfig);
            originalConfigRef.current = initialConfig;

            api
              .getStudioSlotDefinitions(matched.id)
              .then((sRows) => {
                if (sRows.length > 0) {
                  const mapped = sRows.map(toStudioSlot);
                  setSlots(mapped);
                  originalSlotsRef.current = mapped;
                  setSelectedSlotId(mapped[0]?.id || null);
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, [templateId, overrideSlots]);

  // Handle template selection from header dropdown
  const handleSelectTemplate = async (newId: string) => {
    const matched = allTemplates.find((t) => t.id === newId);
    if (matched) {
      const tpl = toStudioTemplate(matched);
      setTemplate(tpl);
      originalTemplateRef.current = tpl;

      const initialConfig =
        matched.default_config && Object.keys(matched.default_config).length > 0
          ? (matched.default_config as SlotConfig)
          : {};
      setSlotConfig(initialConfig);
      originalConfigRef.current = initialConfig;

      try {
        const sRows = await api.getStudioSlotDefinitions(matched.id);
        if (sRows.length > 0) {
          const mapped = sRows.map(toStudioSlot);
          setSlots(mapped);
          originalSlotsRef.current = mapped;
          setSelectedSlotId(mapped[0]?.id || null);
        } else {
          setSlots(seedSlots);
          originalSlotsRef.current = seedSlots;
          setSelectedSlotId(seedSlots[0]?.id || null);
        }
      } catch {
        setSlots(seedSlots);
        originalSlotsRef.current = seedSlots;
        setSelectedSlotId(seedSlots[0]?.id || null);
      }
      showToast(`Đã chuyển sang mẫu: ${matched.name}`);
    } else {
      const seed = seedTemplates.find((t) => t.id === newId);
      if (seed) {
        setTemplate(seed);
        originalTemplateRef.current = seed;
        setSlots(seedSlots);
        originalSlotsRef.current = seedSlots;
        setSlotConfig(seedPublishedSlotConfig);
        originalConfigRef.current = seedPublishedSlotConfig;
        setSelectedSlotId(seedSlots[0]?.id || null);
        showToast(`Đã chuyển sang mẫu: ${seed.name}`);
      }
    }
  };

  // Handle slot drag & position adjustments
  const handleSlotPositionChange = (slotId: string, normX: number, normY: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, normX, normY } : s))
    );
  };

  const handleSlotUpdate = (slotId: string, patch: Partial<SlotDefinition>) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, ...patch } : s))
    );
  };

  // Handle customer adding new custom slot
  const handleSlotAddSubmit = (newSlotData: Omit<SlotDefinition, "id" | "templateId">) => {
    const newSlot: SlotDefinition = {
      ...newSlotData,
      id: `slot-${crypto.randomUUID().slice(0, 8)}`,
      templateId: template.id,
    };
    setSlots((prev) => [...prev, newSlot]);
    setSelectedSlotId(newSlot.id);
    setIsAddSlotModalOpen(false);
    showToast(`✓ Đã thêm vị trí "${newSlot.label}" vào phông cưới`);
  };

  // Handle customer deleting slot
  const handleDeleteSlot = (slotId: string) => {
    const slotToDelete = slots.find((s) => s.id === slotId);
    if (!slotToDelete) return;

    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    setSlotConfig((prev) => {
      const copy = { ...prev };
      delete copy[slotToDelete.slotKey];
      delete copy[slotId];
      return copy;
    });

    setSelectedSlotId((prevId) => {
      if (prevId === slotId) {
        const remaining = slots.filter((s) => s.id !== slotId);
        return remaining[0]?.id || null;
      }
      return prevId;
    });

    showToast(`✓ Đã xoá vị trí "${slotToDelete.label}"`);
  };

  // Assign material from database (Flower, Drape, Fabric, Board, etc.)
  const handleMaterialAssign = (slotKey: string, matOrId: MaterialItem | string) => {
    const isMatObj = typeof matOrId !== "string";
    const matId = isMatObj ? matOrId.id : matOrId;
    const matImg = isMatObj ? matOrId.image_url : undefined;
    const matName = isMatObj ? matOrId.name : "Vật liệu";
    const matColor = isMatObj ? matOrId.color_hex : undefined;

    const matchedSlot = slots.find((s) => s.slotKey === slotKey);
    const slotType = matchedSlot?.slotType || "drape";
    const isDrape = slotType === "drape" || slotType === "drape_detail";

    const synthesizedAsset: Asset = {
      id: matId,
      name: matName,
      assetType: slotType,
      thumbnail: matImg || undefined,
      colorHex: matColor || undefined,
      tags: isMatObj && matOrId.category ? [matOrId.category] : [],
    };

    setSlotConfig((prev) => {
      const existing = prev[slotKey] || {};
      return {
        ...prev,
        [slotKey]: {
          ...existing,
          asset: synthesizedAsset,
          assetId: matId,
          materialId: matId,
          materialImage: matImg,
          colorHex: matColor,
          colorOverride: isDrape ? existing.colorOverride : undefined,
        },
      };
    });
    showToast(`✓ Đã gắn mẫu "${matName}" vào ${matchedSlot?.label || slotKey}`);
  };

  // Assign custom color / tint / filter mode to drape
  const handleColorHexChange = (
    slotKey: string,
    hex: string,
    filterMode?: "multiply_blend" | "flat_tint" | "color_map",
    saturation?: number
  ) => {
    setSlotConfig((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        colorOverride: hex,
        filterMode: filterMode || prev[slotKey]?.filterMode || "multiply_blend",
        colorSaturation: saturation ?? prev[slotKey]?.colorSaturation ?? 100,
      },
    }));
  };

  // Add custom text / monogram asset
  const handleAddCustomAsset = (asset: Omit<Asset, "id">) => {
    const selectedSlot = slots.find((s) => s.id === selectedSlotId);
    if (!selectedSlot) return;

    const fullAsset: Asset = {
      ...asset,
      id: `custom-${Date.now().toString().slice(-6)}`,
    };

    setSlotConfig((prev) => ({
      ...prev,
      [selectedSlot.slotKey]: {
        ...prev[selectedSlot.slotKey],
        customAsset: fullAsset,
        asset: fullAsset,
      },
    }));
    showToast(`Đã cập nhật chữ: ${asset.name}`);
  };

  // Reset to original preset of the CURRENT template or customer's initial snapshot
  const handleReset = () => {
    const confirmMsg = editingLead
      ? `Bạn có chắc muốn đặt lại toàn bộ màu sắc, vật liệu về bản phối cảnh ban đầu của khách hàng "${editingLead.name}"?`
      : `Bạn có chắc muốn đặt lại toàn bộ màu sắc, vật liệu và vị trí về thiết kế ban đầu của mẫu "${template.name}"?`;

    const isConfirmed = window.confirm(confirmMsg);
    if (isConfirmed) {
      setTemplate(originalTemplateRef.current);
      setSlots(JSON.parse(JSON.stringify(originalSlotsRef.current)));
      setSlotConfig(JSON.parse(JSON.stringify(originalConfigRef.current)));
      setSelectedSlotId(originalSlotsRef.current[0]?.id || null);
      showToast(
        editingLead
          ? `Đã khôi phục về bản phối cảnh ban đầu của khách hàng "${editingLead.name}"!`
          : `Đã khôi phục về thiết kế gốc ban đầu của mẫu "${template.name}"!`
      );
    }
  };

  // Admin save updated design snapshot for this lead
  const handleAdminSaveLeadDesign = async () => {
    if (!editingLead || !token) return;
    try {
      showToast("Đang lưu bản cập nhật phối cảnh...");
      const rawCapture = await captureStudioThumbnail();
      let brandedImage = rawCapture;
      if (rawCapture) {
        try {
          brandedImage = await generateBrandedDesignImage(rawCapture, {
            customerName: editingLead.name,
            phone: editingLead.phone,
            weddingDate: editingLead.wedding_date ? String(editingLead.wedding_date) : "",
            templateName: template.name,
            hotline: "0789 241 260",
            website: "pidecor.vn",
            address: "372 Trần Đại Nghĩa, Đà Nẵng",
          });
        } catch (capErr) {
          console.warn("Branding generation failed, using raw capture:", capErr);
        }
      }

      await api.updateLead(
        editingLead.id,
        {
          design_snapshot: {
            template_id: template.id,
            template_name: template.name,
            slot_config: slotConfig,
            custom_slots: slots,
            ...slotConfig,
            preview_image: brandedImage || rawCapture,
            saved_by: "admin",
            saved_at: new Date().toISOString(),
          },
        }
      );

      showToast(`Đã lưu bản phối cảnh mới cho khách hàng "${editingLead.name}"!`);
    } catch (err) {
      console.error("Failed to update lead design:", err);
      showToast("Lưu phối cảnh thất bại!");
    }
  };

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || null;

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

      {/* Main Customer 3-Column Studio Workspace */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr 340px",
          gap: "20px",
          flex: 1,
          alignItems: "start",
        }}
      >
        {/* Left Column: Friendly Slot List */}
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

        {/* Middle Column: Interactive SVG Canvas */}
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

        {/* Right Column: Customer Slot Properties (Color Tint, Materials, Names) */}
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
          <SlotProperties
            slot={selectedSlot}
            slotConfig={slotConfig}
            mode="customer"
            onUpdate={handleSlotUpdate}
            onDelete={handleDeleteSlot}
            onAssignMaterial={(mat, slot) => handleMaterialAssign(slot.slotKey, mat)}
            onAssignColor={(key, hex, filterMode, saturation) =>
              handleColorHexChange(key, hex, filterMode, saturation)
            }
            onAddAsset={handleAddCustomAsset}
          />
        </div>
      </div>

      {/* Add Slot Modal for Customer */}
      <AddSlotModal
        isOpen={isAddSlotModalOpen}
        onClose={() => setIsAddSlotModalOpen(false)}
        onAdd={handleSlotAddSubmit}
        existingSlots={slots}
        existingSlotKeys={slots.map((s) => s.slotKey)}
        mode="customer"
      />

      {/* Save Design & Get Consultation Quote Modal */}
      <SaveDesignModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        slotConfig={slotConfig}
        templateId={template.id}
        templateName={template.name}
        slots={slots}
      />
    </div>
  );
};
