import { useState, useCallback } from "react";
import { useAuth } from "../../../lib/authContext";
import { seedTemplates, seedSlots, seedRules } from "../data/seed/templates";
import { Template, SlotDefinition, SlotRule, SlotConfig } from "../types";
import type { StudioTemplateRow } from "../../../lib/types";
import { useStudioSlotAndRuleHandlers } from "./useStudioSlotAndRuleHandlers";
import { useStudioTemplatePersistence } from "./useStudioTemplatePersistence";

export interface UseAdminEditorProps {
  templateId?: string;
}

export const useAdminEditor = ({ templateId = "tpl-classic-01" }: UseAdminEditorProps) => {
  const { token } = useAuth();

  const [template, setTemplate] = useState<Template>(
    () => seedTemplates.find((t) => t.id === templateId) || seedTemplates[0]
  );
  const [slots, setSlots] = useState<SlotDefinition[]>(seedSlots);
  const [rules, setRules] = useState<SlotRule[]>(seedRules);
  const [slotConfig, setSlotConfig] = useState<SlotConfig>({});
  const [allTemplates, setAllTemplates] = useState<StudioTemplateRow[]>([]);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(seedSlots[0]?.id || null);
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

  const handleUpdateTemplateName = useCallback(
    (newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;
      setTemplate((prev) => ({ ...prev, name: trimmed }));
      setIsDirty(true);
      showToast(`Đã đổi tên mẫu thành "${trimmed}"`);
    },
    [showToast]
  );

  const persistenceHandlers = useStudioTemplatePersistence({
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
  });

  const slotAndRuleHandlers = useStudioSlotAndRuleHandlers({
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
  });

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
    handleUpdateTemplateName,
    ...persistenceHandlers,
    ...slotAndRuleHandlers,
  };
};
