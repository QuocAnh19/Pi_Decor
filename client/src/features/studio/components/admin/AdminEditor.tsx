import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../lib/authContext";
import { api } from "../../../../lib/api";
import {
  toStudioTemplate,
  toStudioSlot,
  toStudioAsset,
  toStudioRule,
} from "../../utils/adapters";
import { seedTemplates, seedSlots, seedRules, seedAssets } from "../../data/seed/templates";
import { Template, SlotDefinition, SlotRule, SlotConfig, Asset, getDefaultSlotDimensions } from "../../types";
import { AdminCanvas } from "./AdminCanvas";
import { SlotList } from "./SlotList";
import { SlotProperties } from "./SlotProperties";
import { RuleList } from "./RuleList";
import { AddSlotModal } from "./AddSlotModal";
import { TemplateUploader } from "./TemplateUploader";
import { CustomerEditor } from "../customer/CustomerEditor";
import { extractSVGColors, hexToHSL, hslToHex } from "../../utils/svgColorUtils";

export interface AdminEditorProps {
  templateId?: string;
  onBackToHome?: () => void;
}

export const AdminEditor: React.FC<AdminEditorProps> = ({
  templateId = "tpl-classic-01",
  onBackToHome,
}) => {
  const { token } = useAuth();

  const [template, setTemplate] = useState<Template>(
    () => seedTemplates.find((t) => t.id === templateId) || seedTemplates[0]
  );
  const [slots, setSlots] = useState<SlotDefinition[]>(seedSlots);
  const [rules, setRules] = useState<SlotRule[]>(seedRules);
  const [slotConfig, setSlotConfig] = useState<SlotConfig>({});

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(seedSlots[0]?.id || null);
  const [showGrid, setShowGrid] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [initialClickNorm, setInitialClickNorm] = useState<{ normX: number; normY: number } | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"slots" | "rules">("slots");

  // Load from API when token is present
  useEffect(() => {
    if (!token) return;

    api
      .getStudioTemplatesAdmin(token)
      .then((rows) => {
        if (rows.length > 0) {
          const matched = rows.find((r) => r.id === templateId) || rows[0];
          setTemplate(toStudioTemplate(matched));

          // Fetch slots for this template
          api
            .getStudioSlotDefinitions(matched.id)
            .then((sRows) => setSlots(sRows.map(toStudioSlot)))
            .catch(() => {});

          // Fetch rules for this template
          api
            .getStudioSlotRules(matched.id)
            .then((rRows) => setRules(rRows.map(toStudioRule)))
            .catch(() => {});
        }
      })
      .catch((err) => console.warn("Failed to load studio templates from API:", err));

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
  }, [token, templateId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Slot Handlers
  const handleSlotMove = (slotId: string, normX: number, normY: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, normX, normY } : s))
    );
    setIsDirty(true);

    if (token) {
      api.updateStudioSlotDefinition(slotId, { norm_x: normX, norm_y: normY }, token).catch(() => {});
    }
  };

  const handleSlotUpdate = (slotId: string, patch: Partial<SlotDefinition>) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, ...patch } : s))
    );
    setIsDirty(true);

    if (token) {
      const rowPatch: Record<string, unknown> = {};
      if (patch.label !== undefined) rowPatch.label = patch.label;
      if (patch.normX !== undefined) rowPatch.norm_x = patch.normX;
      if (patch.normY !== undefined) rowPatch.norm_y = patch.normY;
      if (patch.normWidth !== undefined) rowPatch.norm_width = patch.normWidth;
      if (patch.normHeight !== undefined) rowPatch.norm_height = patch.normHeight;
      if (patch.allowScale !== undefined) rowPatch.allow_scale = patch.allowScale;
      if (patch.allowRotate !== undefined) rowPatch.allow_rotate = patch.allowRotate;

      api.updateStudioSlotDefinition(slotId, rowPatch, token).catch(() => {});
    }
  };

  const handleSlotDelete = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    if (selectedSlotId === slotId) {
      setSelectedSlotId(null);
    }
    setIsDirty(true);
    showToast("Đã xóa slot!");

    if (token) {
      api.deleteStudioSlotDefinition(slotId, token).catch(() => {});
    }
  };

  const handleAddSlot = async (slotData: Omit<SlotDefinition, "id" | "templateId">) => {
    const newSlotId = `slot-${crypto.randomUUID().slice(0, 8)}`;
    const newSlot: SlotDefinition = {
      ...slotData,
      id: newSlotId,
      templateId: template.id,
    };
    setSlots((prev) => [...prev, newSlot]);
    setSelectedSlotId(newSlot.id);
    setIsDirty(true);
    showToast(`Đã tạo slot mới '${newSlot.label}'!`);

    if (token) {
      try {
        await api.createStudioSlotDefinition(
          template.id,
          {
            slot_key: newSlot.slotKey,
            label: newSlot.label,
            slot_type: newSlot.slotType,
            norm_x: newSlot.normX,
            norm_y: newSlot.normY,
            norm_width: newSlot.normWidth,
            norm_height: newSlot.normHeight,
            allow_scale: newSlot.allowScale,
            allow_rotate: newSlot.allowRotate,
            mirror_x: newSlot.mirrorX,
            z_index: newSlot.zIndex,
            sort_order: newSlot.sortOrder,
            required: newSlot.required,
          },
          token
        );
      } catch (err) {
        console.warn("Failed to persist new slot to API:", err);
      }
    }
  };

  const handleDoubleClickCanvas = (normX: number, normY: number) => {
    setInitialClickNorm({ normX, normY });
    setIsAddSlotOpen(true);
  };

  // Rule Handlers
  const handleAddRule = async (ruleData: Omit<SlotRule, "id">) => {
    const newRule: SlotRule = {
      ...ruleData,
      id: `rule-${crypto.randomUUID().slice(0, 8)}`,
    };
    setRules((prev) => [...prev, newRule]);
    setIsDirty(true);
    showToast(`Đã thêm rule mới '${newRule.ruleName}'!`);

    if (token) {
      try {
        await api.createStudioSlotRule(
          template.id,
          {
            rule_name: newRule.ruleName,
            condition_slot: newRule.conditionSlot,
            condition_value: newRule.conditionValue,
            target_slot: newRule.targetSlot,
            action: newRule.action,
            action_value: newRule.actionValue,
            priority: newRule.priority,
          },
          token
        );
      } catch (err) {
        console.warn("Failed to persist rule to API:", err);
      }
    }
  };

  const handleUpdateRule = (ruleId: string, ruleData: Omit<SlotRule, "id">) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, ...ruleData } : r))
    );
    setIsDirty(true);
    showToast("Đã cập nhật rule!");

    if (token) {
      api
        .updateStudioSlotRule(
          ruleId,
          {
            rule_name: ruleData.ruleName,
            condition_slot: ruleData.conditionSlot,
            condition_value: ruleData.conditionValue,
            target_slot: ruleData.targetSlot,
            action: ruleData.action,
            action_value: ruleData.actionValue,
            priority: ruleData.priority,
          },
          token
        )
        .catch(() => {});
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    setIsDirty(true);
    showToast("Đã xóa rule!");

    if (token) {
      api.deleteStudioSlotRule(ruleId, token).catch(() => {});
    }
  };

  // SVG Base Template Upload Handler
  const handleUploadSVG = async (svgContent: string, fileName: string) => {
    const updatedName = fileName.replace(".svg", "");
    setTemplate((prev) => ({
      ...prev,
      name: updatedName,
      svgBase: svgContent,
    }));
    setIsDirty(true);
    showToast(`Đã cập nhật khung phông nền SVG từ '${fileName}'!`);

    if (token) {
      try {
        await api.updateStudioTemplate(template.id, { name: updatedName, svg_base: svgContent }, token);
      } catch (err) {
        console.warn("Failed to update template SVG base on API:", err);
      }
    }
  };

  // SVG Asset Upload Handler
  const handleAddAsset = async (assetData: Omit<Asset, "id">, assignToCurrentSlot?: boolean) => {
    const newAsset: Asset = {
      ...assetData,
      id: `asset-${crypto.randomUUID().slice(0, 8)}`,
    };

    seedAssets.push(newAsset);

    if (token) {
      try {
        const createdRow = await api.createStudioAsset(
          {
            asset_type: newAsset.assetType,
            name: newAsset.name,
            thumbnail: newAsset.thumbnail,
            svg_data: newAsset.svgData,
            color_hex: newAsset.colorHex,
            font_family: newAsset.fontFamily,
            tags: newAsset.tags,
            is_active: newAsset.isActive,
          },
          token
        );
        newAsset.id = createdRow.id;
      } catch (err) {
        console.warn("Failed to persist asset to API:", err);
      }
    }

    if (assignToCurrentSlot) {
      let targetSlot = slots.find((s) => s.id === selectedSlotId);

      if (!targetSlot || targetSlot.slotType !== newAsset.assetType) {
        targetSlot = slots.find((s) => s.slotType === newAsset.assetType);
      }

      if (!targetSlot) {
        const sameTypeSlot = slots.find((s) => s.slotType === newAsset.assetType);
        const defaultDims = getDefaultSlotDimensions(newAsset.assetType);
        const normWidth = sameTypeSlot?.normWidth ?? defaultDims.normWidth;
        const normHeight = sameTypeSlot?.normHeight ?? defaultDims.normHeight;

        const slotKey = `${newAsset.assetType}-${slots.length + 1}`;
        const labelName = newAsset.name.replace(/^Mẫu\s+/, "");

        targetSlot = {
          id: `slot-${crypto.randomUUID().slice(0, 8)}`,
          templateId: template.id,
          slotKey,
          label: labelName,
          slotType: newAsset.assetType,
          normX: 0.5,
          normY: 0.5,
          normWidth,
          normHeight,
          allowScale: true,
          allowRotate: true,
          mirrorX: false,
          zIndex: sameTypeSlot?.zIndex ?? 5,
          sortOrder: slots.length + 1,
        };

        setSlots((prev) => [...prev, targetSlot!]);
      }

      setSelectedSlotId(targetSlot.id);

      setSlotConfig((prev) => {
        const existing = prev[targetSlot!.slotKey];
        const colorOverride = newAsset.colorHex || existing?.colorOverride;
        const filterMode = existing?.filterMode ?? "multiply_blend";

        let colorMap = existing?.colorMap;
        if (colorOverride && newAsset.svgData) {
          const originalColors = extractSVGColors(newAsset.svgData);
          colorMap = {};
          for (const orig of originalColors) {
            const { l } = hexToHSL(orig);
            if (l > 10 && l < 90) {
              const { h: newH, s: newS } = hexToHSL(colorOverride);
              const { l: origL, s: origS } = hexToHSL(orig);
              colorMap[orig] = hslToHex(newH, Math.round((origS + newS) / 2), origL);
            }
          }
        }

        return {
          ...prev,
          [targetSlot!.slotKey]: {
            ...existing,
            assetId: newAsset.id,
            asset: newAsset,
            colorOverride,
            colorMap,
            filterMode,
          },
        };
      });

      setIsDirty(true);
      return;
    }

    setIsDirty(true);
    showToast(`✨ Đã thêm mẫu '${newAsset.name}' vào thư viện Asset!`);
  };

  // Toggle active status for template
  const handleToggleActive = async () => {
    const nextActive = !template.isActive;
    setTemplate((prev) => ({ ...prev, isActive: nextActive }));
    setIsDirty(true);
    showToast(nextActive ? "Đã KÍCH HOẠT template công khai!" : "Đã ẨN template khỏi khách hàng!");

    if (token) {
      try {
        await api.updateStudioTemplate(template.id, { is_active: nextActive }, token);
      } catch (err) {
        console.warn("Failed to toggle template active status on API:", err);
      }
    }
  };

  const handleAssignColor = (
    slotKey: string,
    hex: string,
    filterMode: "multiply_blend" | "flat_tint" | "color_map" = "multiply_blend",
    colorSaturation: number = 100
  ) => {
    setSlotConfig((prev) => {
      const existing = prev[slotKey];
      const asset = existing?.asset;
      let colorMap: Record<string, string> | undefined;

      if (asset?.svgData) {
        const originalColors = extractSVGColors(asset.svgData);
        colorMap = {};
        for (const orig of originalColors) {
          const { l } = hexToHSL(orig);
          if (l > 10 && l < 90) {
            const { h: newH, s: newS } = hexToHSL(hex);
            const { l: origL, s: origS } = hexToHSL(orig);
            colorMap[orig] = hslToHex(newH, Math.round((origS + newS) / 2), origL);
          }
        }
      }

      return {
        ...prev,
        [slotKey]: {
          ...existing,
          colorOverride: hex,
          colorMap,
          filterMode,
          colorSaturation,
        },
      };
    });
    setIsDirty(true);
  };

  const handlePublish = async () => {
    try {
      if (token) {
        await api.updateStudioTemplate(
          template.id,
          {
            name: template.name,
            svg_base: template.svgBase,
            is_active: template.isActive,
          },
          token
        );
      }

      setIsDirty(false);
      showToast("🚀 Đã xuất bản (Publish) cấu hình Template & Slot mới thành công!");
    } catch (err: unknown) {
      console.error("Failed to publish template:", err);
      showToast(`❌ Lỗi xuất bản: ${err instanceof Error ? err.message : "Không thể lưu cấu hình"}`);
    }
  };

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
          <span>👁️ Đang trong chế độ Preview (Khách Hàng)</span>
          <button
            onClick={() => setIsPreviewMode(false)}
            style={{
              backgroundColor: "#ffffff",
              color: "#e11d48",
              border: "none",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ← Thoát Preview
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
        padding: "20px",
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
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#1e293b",
          padding: "16px 24px",
          borderRadius: "12px",
          border: "1px solid #334155",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              style={{
                padding: "6px 12px",
                backgroundColor: "#334155",
                color: "#f8fafc",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              ← Quay lại Admin
            </button>
          )}

          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", fontFamily: "'Playfair Display', serif", color: "#ffffff" }}>
              🛠️ Admin Studio Editor — {template.name}
            </h1>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
              Đặt slot trên canvas • Snap-to-grid 10px • Upload Rèm/Hoa SVG vào Slot
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={handleToggleActive}
            style={{
              padding: "8px 14px",
              backgroundColor: template.isActive ? "#16a34a" : "#64748b",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {template.isActive ? "🟢 Đang hiển thị" : "⚪ Đã ẩn"}
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            style={{
              padding: "8px 14px",
              backgroundColor: showGrid ? "#38bdf8" : "#334155",
              color: showGrid ? "#0f172a" : "#f8fafc",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🌐 Grid {showGrid ? "Bật (10px)" : "Tắt"}
          </button>

          <button
            onClick={() => setIsPreviewMode(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#334155",
              color: "#f8fafc",
              border: "1px solid #475569",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            👁️ Preview Khách Hàng
          </button>

          <button
            onClick={handlePublish}
            style={{
              padding: "8px 18px",
              backgroundColor: "#e11d48",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(225, 29, 72, 0.4)",
              position: "relative",
            }}
          >
            {isDirty && (
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#fbbf24",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "6px",
                }}
              />
            )}
            🚀 Publish Template
          </button>
        </div>
      </header>

      {/* Main Admin 3-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 340px", gap: "20px", flex: 1, alignItems: "start" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <TemplateUploader
            onUploadBase={handleUploadSVG}
            onAddAsset={handleAddAsset}
          />

          <div style={{ display: "flex", backgroundColor: "#1e293b", padding: "4px", borderRadius: "8px", border: "1px solid #334155" }}>
            <button
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
              Rules ({rules.length})
            </button>
          </div>

          <div style={{ flex: 1 }}>
            {activeTab === "slots" ? (
              <SlotList
                slots={slots}
                selectedSlotId={selectedSlotId}
                onSelect={(id) => setSelectedSlotId(id)}
                onAddSlot={() => {
                  setInitialClickNorm(undefined);
                  setIsAddSlotOpen(true);
                }}
              />
            ) : (
              <RuleList
                rules={rules}
                slots={slots}
                onAddRule={handleAddRule}
                onUpdateRule={handleUpdateRule}
                onDeleteRule={handleDeleteRule}
              />
            )}
          </div>
        </div>

        {/* Middle Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
            <span>💡 Mẹo: Kéo thả các marker để đổi vị trí (snap grid 10px). Nhấp kép canvas để thêm Slot mới.</span>
            <span>Viewport: 800 × 600</span>
          </div>

          <div style={{ flex: 1, minHeight: "520px" }}>
            <AdminCanvas
              template={template}
              slots={slots}
              slotConfig={slotConfig}
              selectedSlotId={selectedSlotId}
              showGrid={showGrid}
              onSlotSelect={(id) => setSelectedSlotId(id)}
              onSlotMove={handleSlotMove}
              onSlotUpdate={handleSlotUpdate}
              onDoubleClickEmpty={handleDoubleClickCanvas}
            />
          </div>
        </div>

        {/* Right Column */}
        <div style={{ position: "sticky", top: "24px", maxHeight: "calc(100vh - 140px)" }}>
          <SlotProperties
            slot={selectedSlot}
            slotConfig={slotConfig}
            onUpdate={handleSlotUpdate}
            onDelete={handleSlotDelete}
            onAddAsset={handleAddAsset}
            onAssignColor={handleAssignColor}
          />
        </div>
      </div>

      <AddSlotModal
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        onAdd={handleAddSlot}
        existingSlots={slots}
        existingSlotKeys={slots.map((s) => s.slotKey)}
        initialNormPos={initialClickNorm}
      />
    </div>
  );
};
