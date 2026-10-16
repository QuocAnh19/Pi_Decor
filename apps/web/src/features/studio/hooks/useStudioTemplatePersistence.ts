import React, { useCallback, useEffect } from "react";
import { api } from "../../../lib/api";
import {
  toStudioTemplate,
  toStudioSlot,
  toStudioAsset,
  toStudioRule,
  toTemplatePublishPayload,
  parseTemplateDefaultConfig,
} from "../../../lib/mappers";
import { captureStudioThumbnail } from "../utils/captureThumbnail";
import { seedTemplates, seedSlots, seedRules, seedAssets } from "../data/seed/templates";
import type { Template, SlotDefinition, SlotRule, SlotConfig } from "../types";
import type { StudioTemplateRow } from "../../../lib/types";

interface UseStudioTemplatePersistenceParams {
  token: string | null;
  templateId: string;
  template: Template;
  setTemplate: React.Dispatch<React.SetStateAction<Template>>;
  slots: SlotDefinition[];
  setSlots: React.Dispatch<React.SetStateAction<SlotDefinition[]>>;
  rules: SlotRule[];
  setRules: React.Dispatch<React.SetStateAction<SlotRule[]>>;
  slotConfig: SlotConfig;
  setSlotConfig: React.Dispatch<React.SetStateAction<SlotConfig>>;
  allTemplates: StudioTemplateRow[];
  setAllTemplates: React.Dispatch<React.SetStateAction<StudioTemplateRow[]>>;
  setSelectedSlotId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: (msg: string) => void;
}

/**
 * Quản lý nạp danh sách mẫu từ máy chủ, chọn mẫu, lưu nháp, xuất bản và chụp ảnh đại diện.
 */
export function useStudioTemplatePersistence({
  token,
  templateId,
  template,
  setTemplate,
  slots,
  setSlots,
  rules,
  setRules,
  slotConfig,
  setSlotConfig,
  allTemplates,
  setAllTemplates,
  setSelectedSlotId,
  setIsDirty,
  showToast,
}: UseStudioTemplatePersistenceParams) {
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
  }, [setTemplate, setSlots, setRules, setSlotConfig, setSelectedSlotId, setIsDirty]);

  const loadTemplatesFromAPI = useCallback(
    (targetIdOverride?: string) => {
      if (!token) return;

      api
        .getStudioTemplatesAdmin()
        .then(async (rows) => {
          setAllTemplates(rows);
          const currentTargetId = targetIdOverride || template.id || templateId;

          if (rows.length > 0) {
            const matched = rows.find(
              (r) => r.id === currentTargetId || (currentTargetId !== "new" && r.id === templateId)
            );
            if (matched) {
              setTemplate(toStudioTemplate(matched));
              setSlotConfig(parseTemplateDefaultConfig(matched.default_config));

              try {
                const sRows = await api.getStudioSlotDefinitions(matched.id);
                if (sRows.length > 0) {
                  setSlots(sRows.map(toStudioSlot));
                  setSelectedSlotId(sRows[0].id);
                }
              } catch {
                // Giữ mặc định nếu không tải được danh sách slot
              }

              try {
                const rRows = await api.getStudioSlotRules(matched.id);
                setRules(rRows.map(toStudioRule));
              } catch {
                // Giữ mặc định nếu không tải được quy tắc
              }
              return;
            }
          }

          if ((currentTargetId === "new" || !currentTargetId) && !targetIdOverride) {
            handleCreateNewTemplate();
          }
        })
        .catch((err) => console.warn("Failed to load studio templates from API:", err));
    },
    [
      token,
      template.id,
      templateId,
      handleCreateNewTemplate,
      setAllTemplates,
      setTemplate,
      setSlotConfig,
      setSlots,
      setSelectedSlotId,
      setRules,
    ]
  );

  useEffect(() => {
    loadTemplatesFromAPI();

    if (token) {
      api
        .getStudioAssetsAdmin()
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
    setSlotConfig(parseTemplateDefaultConfig(matched.default_config));

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

  const saveTemplateStatus = async (isActive: boolean) => {
    const actionLabel = isActive ? "xuất bản" : "lưu nháp";
    try {
      let thumbnailData = template.thumbnail;
      try {
        const captured = await captureStudioThumbnail();
        if (captured) thumbnailData = captured;
      } catch (captureErr) {
        console.warn("Could not capture preview thumbnail:", captureErr);
      }

      if (token) {
        const res = await api.publishStudioTemplate(
          template.id,
          toTemplatePublishPayload({
            template,
            isActive,
            thumbnail: thumbnailData,
            slots,
            rules,
            slotConfig,
          })
        );
        const savedId = res?.template?.id || template.id;
        const savedThumbnail = res?.template?.thumbnail || thumbnailData;
        setTemplate((prev) => ({
          ...prev,
          id: savedId,
          isActive,
          thumbnail: savedThumbnail,
        }));
        setIsDirty(false);
        showToast(
          isActive
            ? "Đã xuất bản template và cập nhật ảnh đại diện thành công!"
            : "✓ Đã lưu nháp template và cập nhật ảnh đại diện vào CSDL!"
        );
        loadTemplatesFromAPI(savedId);
      } else {
        setTemplate((prev) => ({ ...prev, isActive, thumbnail: thumbnailData }));
        setIsDirty(false);
        showToast(isActive ? "Đã lưu thiết kế!" : "✓ Đã lưu nháp template!");
      }
    } catch (err: unknown) {
      console.error(`Failed to ${isActive ? "publish" : "save"} template:`, err);
      showToast(
        `Lỗi ${actionLabel}: ${err instanceof Error ? err.message : "Không thể lưu cấu hình"}`
      );
    }
  };

  const handlePublish = () => saveTemplateStatus(true);
  const handleSaveDraft = () => saveTemplateStatus(false);

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
          toTemplatePublishPayload({
            template,
            isActive: template.isActive,
            thumbnail: captured,
            slots,
            rules,
            slotConfig,
          })
        );
        const savedThumbnail = res?.template?.thumbnail || captured;
        setTemplate((prev) => ({ ...prev, thumbnail: savedThumbnail }));
        showToast("✓ Đã chụp và cập nhật ảnh đại diện mới thành công!");
        loadTemplatesFromAPI(template.id);
      } else {
        setTemplate((prev) => ({ ...prev, thumbnail: captured }));
        showToast("✓ Đã chụp ảnh đại diện!");
      }
    } catch (err) {
      console.error("Failed to capture thumbnail:", err);
      showToast("Lỗi khi lưu ảnh đại diện.");
    }
  };

  return {
    loadTemplatesFromAPI,
    handleCreateNewTemplate,
    handleSelectTemplate,
    handleSaveDraft,
    handlePublish,
    handleCaptureThumbnail,
  };
}
