import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../lib/authContext";
import { api } from "../../../lib/api";
import {
  toStudioTemplate,
  toStudioSlot,
  toStudioAsset,
  toStudioRule,
} from "../utils/adapters";
import { captureStudioThumbnail } from "../utils/captureThumbnail";
import {
  seedTemplates,
  seedSlots,
  seedRules,
  seedAssets,
} from "../data/seed/templates";
import {
  Template,
  SlotDefinition,
  SlotRule,
  SlotConfig,
  Asset,
} from "../types";
import type { StudioTemplateRow, MaterialItem } from "../../../lib/types";

export interface UseAdminEditorProps {
  templateId?: string;
}

export const useAdminEditor = ({ templateId = "tpl-classic-01" }: UseAdminEditorProps) => {
  const { token } = useAuth();

  const [template, setTemplate] = useState<Template>(
    () => seedTemplates.find((t) => t.id === templateId) || seedTemplates[0],
  );
  const [slots, setSlots] = useState<SlotDefinition[]>(seedSlots);
  const [rules, setRules] = useState<SlotRule[]>(seedRules);
  const [slotConfig, setSlotConfig] = useState<SlotConfig>({});
  const [allTemplates, setAllTemplates] = useState<StudioTemplateRow[]>([]);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    seedSlots[0]?.id || null,
  );
  const [showGrid, setShowGrid] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [initialClickNorm, setInitialClickNorm] = useState<
    { normX: number; normY: number } | undefined
  >(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"slots" | "rules">("slots");

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  }, []);

  const handleUpdateTemplateName = useCallback((newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setTemplate((prev) => ({ ...prev, name: trimmed }));
    setIsDirty(true);
    showToast(`Đã đổi tên mẫu thành "${trimmed}"`);
  }, [showToast]);

  const handleCreateNewTemplate = useCallback(() => {
    const newId = crypto.randomUUID();
    const uniqueSuffix = Date.now().toString().slice(-4);
    const newTpl: Template = {
      id: newId,
      name: `Mẫu Phông Cưới Mới #${uniqueSuffix}`,
      svgBase: seedTemplates[0].svgBase,
      category: "fabric",
      isActive: false,
    };

    setTemplate(newTpl);
    setSlots(seedSlots);
    setRules(seedRules);
    setSlotConfig({});
    setSelectedSlotId(seedSlots[0]?.id || null);
    setIsDirty(true);
  }, []);

  const loadTemplatesFromAPI = useCallback(
    (targetIdOverride?: string) => {
      if (!token) return;

      api
        .getStudioTemplatesAdmin(token)
        .then(async (rows) => {
          setAllTemplates(rows);

          const currentTargetId = targetIdOverride || template.id || templateId;

          if (rows.length > 0) {
            const matched = rows.find(
              (r) => r.id === currentTargetId || (currentTargetId !== "new" && r.id === templateId)
            );
            if (matched) {
              setTemplate(toStudioTemplate(matched));

              if (
                matched.default_config &&
                Object.keys(matched.default_config).length > 0
              ) {
                setSlotConfig(matched.default_config as SlotConfig);
              }

              try {
                const sRows = await api.getStudioSlotDefinitions(matched.id);
                if (sRows.length > 0) {
                  setSlots(sRows.map(toStudioSlot));
                  setSelectedSlotId(sRows[0].id);
                }
              } catch {}

              try {
                const rRows = await api.getStudioSlotRules(matched.id);
                setRules(rRows.map(toStudioRule));
              } catch {}

              return;
            }
          }

          if ((currentTargetId === "new" || !currentTargetId) && !targetIdOverride) {
            handleCreateNewTemplate();
          }
        })
        .catch((err) =>
          console.warn("Failed to load studio templates from API:", err),
        );
    },
    [token, template.id, templateId, handleCreateNewTemplate],
  );

  useEffect(() => {
    loadTemplatesFromAPI();

    if (token) {
      api
        .getStudioAssetsAdmin(token)
        .then((aRows) => {
          const loadedAssets = aRows.map(toStudioAsset);
          loadedAssets.forEach((a) => {
            if (!seedAssets.some((existing) => existing.id === a.id)) {
              seedAssets.push(a);
            }
          });
        })
        .catch(() => {});
    }
  }, [token, templateId, loadTemplatesFromAPI]);

  const handleSelectTemplate = async (targetId: string) => {
    const matched = allTemplates.find((t) => t.id === targetId);
    if (!matched) return;

    setTemplate(toStudioTemplate(matched));

    if (
      matched.default_config &&
      Object.keys(matched.default_config).length > 0
    ) {
      setSlotConfig(matched.default_config as SlotConfig);
    } else {
      setSlotConfig({});
    }

    try {
      const sRows = await api.getStudioSlotDefinitions(matched.id);
      if (sRows.length > 0) {
        setSlots(sRows.map(toStudioSlot));
        setSelectedSlotId(sRows[0].id);
      } else {
        setSlots(seedSlots);
      }
    } catch {
      setSlots(seedSlots);
    }

    try {
      const rRows = await api.getStudioSlotRules(matched.id);
      setRules(rRows.map(toStudioRule));
    } catch {
      setRules([]);
    }
  };

  const handlePublish = async () => {
    try {
      let thumbnailData = template.thumbnail;
      try {
        const captured = await captureStudioThumbnail();
        if (captured) {
          thumbnailData = captured;
        }
      } catch (captureErr) {
        console.warn("Could not capture preview thumbnail:", captureErr);
      }

      if (token) {
        const res = await api.publishStudioTemplate(
          template.id,
          {
            name: template.name,
            thumbnail: thumbnailData,
            svg_base: template.svgBase,
            is_active: true,
            category: template.category ?? null,
            slots,
            rules,
            slot_config: slotConfig as Record<string, unknown>,
          },
          token,
        );
        const savedId = res?.template?.id || template.id;
        const savedThumbnail = res?.template?.thumbnail || thumbnailData;
        setTemplate((prev) => ({
          ...prev,
          id: savedId,
          isActive: true,
          thumbnail: savedThumbnail,
        }));
        setIsDirty(false);
        showToast("Đã xuất bản template và cập nhật ảnh đại diện thành công!");
        loadTemplatesFromAPI(savedId);
      } else {
        setTemplate((prev) => ({
          ...prev,
          isActive: true,
          thumbnail: thumbnailData,
        }));
        setIsDirty(false);
        showToast("Đã lưu thiết kế!");
      }
    } catch (err: unknown) {
      console.error("Failed to publish template:", err);
      showToast(
        `Lỗi xuất bản: ${err instanceof Error ? err.message : "Không thể lưu cấu hình"}`,
      );
    }
  };

  const handleSaveDraft = async () => {
    try {
      let thumbnailData = template.thumbnail;
      try {
        const captured = await captureStudioThumbnail();
        if (captured) {
          thumbnailData = captured;
        }
      } catch (captureErr) {
        console.warn("Could not capture preview thumbnail:", captureErr);
      }

      if (token) {
        const res = await api.publishStudioTemplate(
          template.id,
          {
            name: template.name,
            thumbnail: thumbnailData,
            svg_base: template.svgBase,
            is_active: false,
            category: template.category ?? null,
            slots,
            rules,
            slot_config: slotConfig as Record<string, unknown>,
          },
          token,
        );
        const savedId = res?.template?.id || template.id;
        const savedThumbnail = res?.template?.thumbnail || thumbnailData;
        setTemplate((prev) => ({
          ...prev,
          id: savedId,
          isActive: false,
          thumbnail: savedThumbnail,
        }));
        setIsDirty(false);
        showToast("✓ Đã lưu nháp template và cập nhật ảnh đại diện vào CSDL!");
        loadTemplatesFromAPI(savedId);
      } else {
        setTemplate((prev) => ({
          ...prev,
          isActive: false,
          thumbnail: thumbnailData,
        }));
        setIsDirty(false);
        showToast("✓ Đã lưu nháp template!");
      }
    } catch (err: unknown) {
      console.error("Failed to save template draft:", err);
      showToast(
        `Lỗi lưu nháp: ${err instanceof Error ? err.message : "Không thể lưu bản nháp"}`,
      );
    }
  };

  const handleCaptureThumbnail = async () => {
    try {
      showToast("Đang chụp ảnh đại diện...");
      const captured = await captureStudioThumbnail();
      if (!captured) {
        showToast("Không chụp được ảnh canvas.");
        return;
      }

      if (token) {
        const res = await api.publishStudioTemplate(
          template.id,
          {
            name: template.name,
            thumbnail: captured,
            svg_base: template.svgBase,
            is_active: template.isActive,
            category: template.category ?? null,
            slots,
            rules,
            slot_config: slotConfig as Record<string, unknown>,
          },
          token,
        );
        const savedThumbnail = res?.template?.thumbnail || captured;
        setTemplate((prev) => ({
          ...prev,
          thumbnail: savedThumbnail,
        }));
        showToast("✓ Đã chụp và cập nhật ảnh đại diện mới thành công!");
        loadTemplatesFromAPI(template.id);
      } else {
        setTemplate((prev) => ({
          ...prev,
          thumbnail: captured,
        }));
        showToast("✓ Đã chụp ảnh đại diện!");
      }
    } catch (err) {
      console.error("Failed to capture thumbnail:", err);
      showToast("Lỗi khi lưu ảnh đại diện.");
    }
  };

  const handleToggleActive = () => {
    setTemplate((prev) => ({ ...prev, isActive: !prev.isActive }));
    setIsDirty(true);
  };

  const handleSlotPositionChange = (slotId: string, normX: number, normY: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, normX, normY } : s)),
    );
    setIsDirty(true);
  };

  const handleSlotDimensionsChange = (
    slotId: string,
    normWidth: number,
    normHeight: number,
  ) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, normWidth, normHeight } : s)),
    );
    setIsDirty(true);
  };

  const handleSlotUpdate = (slotId: string, patch: Partial<SlotDefinition>) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, ...patch } : s)),
    );
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
      api.deleteStudioSlotDefinition(slotId, token).catch(() => {});
    }

    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    setRules((prev) =>
      prev.filter(
        (r) =>
          r.conditionSlot !== slotToDelete.slotKey &&
          r.targetSlot !== slotToDelete.slotKey,
      ),
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
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, ...patch } : r)),
    );
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
    showToast,
    loadTemplatesFromAPI,
    handleCreateNewTemplate,
    handleSelectTemplate,
    handleSaveDraft,
    handlePublish,
    handleCaptureThumbnail,
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
    handleUpdateTemplateName,
  };
};
