import { useState, useEffect, useCallback, useRef } from "react";
import { Template, SlotDefinition, SlotConfig, Asset } from "../types";
import type { StudioTemplateRow, MaterialItem, Lead } from "../../../lib/types";
import { seedTemplates, seedSlots, seedPublishedSlotConfig } from "../data/seed/templates";
import { toStudioTemplate, toStudioSlot, parseTemplateDefaultConfig, buildDesignSnapshot } from "../../../lib/mappers";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/authContext";
import { captureStudioThumbnail, generateBrandedDesignImage } from "../utils/captureThumbnail";

interface UseCustomerEditorOptions {
  templateId?: string;
  overrideSlots?: SlotDefinition[];
  overrideSlotConfig?: SlotConfig;
  editingLead?: Lead | null;
}

/**
 * Quản lý state và các thao tác chỉnh sửa phối cảnh cho CustomerEditor.
 */
export function useCustomerEditor({
  templateId = "tpl-classic-01",
  overrideSlots,
  overrideSlotConfig,
  editingLead,
}: UseCustomerEditorOptions) {
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

  const originalTemplateRef = useRef<Template>(
    seedTemplates.find((t) => t.id === templateId) || seedTemplates[0]
  );
  const originalSlotsRef = useRef<SlotDefinition[]>(overrideSlots || seedSlots);
  const originalConfigRef = useRef<SlotConfig>(
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

  const applyTemplateToState = async (matched: StudioTemplateRow, fallbackToSeed = false) => {
    const tpl = toStudioTemplate(matched);
    setTemplate(tpl);
    originalTemplateRef.current = tpl;

    const initialConfig = parseTemplateDefaultConfig(matched.default_config);
    setSlotConfig(initialConfig);
    originalConfigRef.current = initialConfig;

    try {
      const sRows = await api.getStudioSlotDefinitions(matched.id);
      if (sRows.length > 0) {
        const mapped = sRows.map(toStudioSlot);
        setSlots(mapped);
        originalSlotsRef.current = mapped;
        setSelectedSlotId(mapped[0]?.id || null);
      } else if (fallbackToSeed) {
        setSlots(seedSlots);
        originalSlotsRef.current = seedSlots;
        setSelectedSlotId(seedSlots[0]?.id || null);
      }
    } catch {
      if (fallbackToSeed) {
        setSlots(seedSlots);
        originalSlotsRef.current = seedSlots;
        setSelectedSlotId(seedSlots[0]?.id || null);
      }
    }
  };

  useEffect(() => {
    api
      .getStudioTemplates()
      .then((rows) => {
        if (Array.isArray(rows) && rows.length > 0) {
          setAllTemplates(rows);
          const matched = rows.find((r) => r.id === templateId);
          if (matched && !overrideSlots) {
            applyTemplateToState(matched, false);
          }
        }
      })
      .catch(() => {});
  }, [templateId, overrideSlots]);

  const handleSelectTemplate = async (newId: string) => {
    const matched = allTemplates.find((t) => t.id === newId);
    if (matched) {
      await applyTemplateToState(matched, true);
      showToast(`Đã chuyển sang mẫu: ${matched.name}`);
      return;
    }
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
  };

  const handleSlotPositionChange = (slotId: string, normX: number, normY: number) => {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, normX, normY } : s)));
  };

  const handleSlotUpdate = (slotId: string, patch: Partial<SlotDefinition>) => {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, ...patch } : s)));
  };

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
    setSelectedSlotId((prevId) =>
      prevId === slotId ? slots.filter((s) => s.id !== slotId)[0]?.id || null : prevId
    );
    showToast(`✓ Đã xoá vị trí "${slotToDelete.label}"`);
  };

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

  const handleAddCustomAsset = (asset: Omit<Asset, "id">) => {
    const selectedSlot = slots.find((s) => s.id === selectedSlotId);
    if (!selectedSlot) return;
    const fullAsset: Asset = { ...asset, id: `custom-${Date.now().toString().slice(-6)}` };
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

  const handleReset = () => {
    const confirmMsg = editingLead
      ? `Bạn có chắc muốn đặt lại toàn bộ màu sắc, vật liệu về bản phối cảnh ban đầu của khách hàng "${editingLead.name}"?`
      : `Bạn có chắc muốn đặt lại toàn bộ màu sắc, vật liệu và vị trí về thiết kế ban đầu của mẫu "${template.name}"?`;

    if (window.confirm(confirmMsg)) {
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
      await api.updateLead(editingLead.id, {
        design_snapshot: buildDesignSnapshot({
          templateId: template.id,
          templateName: template.name,
          slotConfig,
          slots,
          previewImage: brandedImage || rawCapture,
          savedBy: "admin",
        }),
      });
      showToast(`Đã lưu bản phối cảnh mới cho khách hàng "${editingLead.name}"!`);
    } catch (err) {
      console.error("Failed to update lead design:", err);
      showToast("Lưu phối cảnh thất bại!");
    }
  };

  return {
    template, allTemplates, slots, slotConfig, selectedSlotId, setSelectedSlotId,
    showGrid, setShowGrid, isSaveModalOpen, setIsSaveModalOpen,
    isAddSlotModalOpen, setIsAddSlotModalOpen, toastMessage,
    handleSelectTemplate, handleSlotPositionChange, handleSlotUpdate,
    handleSlotAddSubmit, handleDeleteSlot, handleMaterialAssign,
    handleColorHexChange, handleAddCustomAsset, handleReset, handleAdminSaveLeadDesign,
  };
}
