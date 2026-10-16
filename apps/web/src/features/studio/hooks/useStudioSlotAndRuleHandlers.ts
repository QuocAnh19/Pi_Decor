import React from "react";
import { api } from "../../../lib/api";
import type { MaterialItem } from "../../../lib/types";
import type { Template, SlotDefinition, SlotRule, SlotConfig, Asset } from "../types";

interface UseStudioSlotAndRuleHandlersParams {
  token: string | null;
  template: Template;
  setTemplate: React.Dispatch<React.SetStateAction<Template>>;
  slots: SlotDefinition[];
  setSlots: React.Dispatch<React.SetStateAction<SlotDefinition[]>>;
  setRules: React.Dispatch<React.SetStateAction<SlotRule[]>>;
  setSlotConfig: React.Dispatch<React.SetStateAction<SlotConfig>>;
  selectedSlotId: string | null;
  setSelectedSlotId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddSlotOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setInitialClickNorm: React.Dispatch<
    React.SetStateAction<{ normX: number; normY: number } | undefined>
  >;
  showToast: (msg: string) => void;
}

/**
 * Tách riêng các hàm xử lý thao tác trên slot, quy tắc (rules), gán vật liệu và đổi màu trong AdminEditor.
 */
export function useStudioSlotAndRuleHandlers({
  token,
  template,
  setTemplate,
  slots,
  setSlots,
  setRules,
  setSlotConfig,
  selectedSlotId,
  setSelectedSlotId,
  setIsDirty,
  setIsAddSlotOpen,
  setInitialClickNorm,
  showToast,
}: UseStudioSlotAndRuleHandlersParams) {
  const handleToggleActive = () => {
    setTemplate((prev) => ({ ...prev, isActive: !prev.isActive }));
    setIsDirty(true);
  };

  const handleSlotPositionChange = (slotId: string, normX: number, normY: number) => {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, normX, normY } : s)));
    setIsDirty(true);
  };

  const handleSlotDimensionsChange = (slotId: string, normWidth: number, normHeight: number) => {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, normWidth, normHeight } : s)));
    setIsDirty(true);
  };

  const handleSlotUpdate = (slotId: string, patch: Partial<SlotDefinition>) => {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, ...patch } : s)));
    setIsDirty(true);
  };

  const handleAddSlotClick = (normX?: number, normY?: number) => {
    if (normX !== undefined && normY !== undefined) {
      setInitialClickNorm({ normX, normY });
    } else {
      setInitialClickNorm(undefined);
    }
    setIsAddSlotOpen(true);
  };

  const handleSlotAddSubmit = (newSlotData: Omit<SlotDefinition, "id" | "templateId">) => {
    const newSlot: SlotDefinition = {
      ...newSlotData,
      templateId: template.id,
      id: `slot-${Date.now()}`,
    };
    setSlots((prev) => [...prev, newSlot]);
    setSelectedSlotId(newSlot.id);
    setIsDirty(true);
    setIsAddSlotOpen(false);
    showToast(`Đã thêm slot "${newSlot.label}"`);
  };

  const handleDeleteSlot = (slotId: string) => {
    const slotToDelete = slots.find((s) => s.id === slotId);
    if (!slotToDelete) return;

    if (token) {
      api.deleteStudioSlotDefinition(slotId).catch(() => {});
    }

    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    setRules((prev) =>
      prev.filter(
        (r) => r.conditionSlot !== slotToDelete.slotKey && r.targetSlot !== slotToDelete.slotKey
      )
    );
    setSlotConfig((prev) => {
      const next = { ...prev };
      delete next[slotToDelete.slotKey];
      return next;
    });
    if (selectedSlotId === slotId) {
      setSelectedSlotId(null);
    }
    setIsDirty(true);
    showToast(`Đã xóa slot "${slotToDelete.label}"`);
  };

  const handleRuleAdd = (rule: Omit<SlotRule, "id">) => {
    const newRule: SlotRule = {
      ...rule,
      id: `rule-${Date.now()}`,
    };
    setRules((prev) => [...prev, newRule]);
    setIsDirty(true);
    showToast("Đã thêm quy tắc mới");
  };

  const handleRuleUpdate = (ruleId: string, patch: Partial<SlotRule>) => {
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, ...patch } : r)));
    setIsDirty(true);
  };

  const handleRuleDelete = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    setIsDirty(true);
    showToast("Đã xóa quy tắc");
  };

  const handleSvgUpload = (svgContent: string, name?: string) => {
    setTemplate((prev) => ({
      ...prev,
      svgBase: svgContent,
      name: name || prev.name,
    }));
    setIsDirty(true);
    showToast("Đã cập nhật file phông nền SVG mới!");
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
    setIsDirty(true);
    showToast(`✓ Đã gán vật liệu "${matName}"`);
  };

  const handleColorHexChange = (
    slotKey: string,
    colorHex: string,
    filterMode?: "multiply_blend" | "flat_tint" | "color_map",
    saturation?: number
  ) => {
    const matchedSlot = slots.find((s) => s.slotKey === slotKey);
    const slotType = matchedSlot?.slotType || "drape";

    setSlotConfig((prev) => {
      const existing = prev[slotKey];
      const updatedAsset: Asset = existing?.asset
        ? { ...existing.asset, colorHex }
        : {
            id: `color-${Date.now()}`,
            name: `Màu ${colorHex}`,
            assetType: slotType,
            colorHex,
          };

      return {
        ...prev,
        [slotKey]: {
          ...existing,
          colorOverride: colorHex,
          colorHex,
          filterMode: filterMode || existing?.filterMode || "multiply_blend",
          colorSaturation: saturation !== undefined ? saturation : existing?.colorSaturation,
          asset: updatedAsset,
        },
      };
    });
    setIsDirty(true);
  };

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
    setIsDirty(true);
    showToast(`✓ Đã cập nhật chữ: ${asset.name}`);
  };

  return {
    handleToggleActive,
    handleSlotPositionChange,
    handleSlotDimensionsChange,
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
  };
}
