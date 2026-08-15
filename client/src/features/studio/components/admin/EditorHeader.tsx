import React from "react";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  Squares2X2Icon,
  CloudArrowUpIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import type { Template } from "../../types";
import type { StudioTemplateRow } from "../../../../lib/types";
import { Badge, Select } from "../../../../components/ui";
import styles from "./EditorHeader.module.scss";

export interface EditorHeaderProps {
  template: Template;
  allTemplates: StudioTemplateRow[];
  isDirty: boolean;
  isPreviewMode: boolean;
  showGrid: boolean;
  onBackToHome?: () => void;
  onSelectTemplate: (templateId: string) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onToggleActive: () => void;
  onTogglePreview: () => void;
  onToggleGrid: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  template,
  allTemplates,
  isDirty,
  isPreviewMode,
  showGrid,
  onBackToHome,
  onSelectTemplate,
  onSaveDraft,
  onPublish,
  onToggleActive,
  onTogglePreview,
  onToggleGrid,
}) => {
  const templateOptions =
    allTemplates.length === 0
      ? [
          {
            value: template.id,
            label: `${template.isActive ? "🟢 [Công Khai]" : "⚪ [Bản Nháp]"} ${template.name}`,
          },
        ]
      : allTemplates.map((t) => ({
          value: t.id,
          label: `${t.is_active ? "🟢 [Công Khai]" : "⚪ [Bản Nháp]"} ${t.name}`,
        }));

  return (
    <div className={styles.header}>
      {/* Left side: Back Button & Template Selector */}
      <div className={styles.leftSection}>
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className={styles.backBtn}
          >
            <ArrowLeftIcon className="h-4 w-4" style={{ width: 14, height: 14 }} /> Quay lại
          </button>
        )}

        <div className={styles.templateGroup}>
          <span className={styles.editingLabel}>
            Đang sửa:
          </span>
          <div style={{ minWidth: "220px" }}>
            <Select
              fullWidth={false}
              value={template.id}
              onChange={(e) => onSelectTemplate(e.target.value)}
              options={templateOptions}
            />
          </div>

          {isDirty && (
            <Badge tone="warning">
              ● Đã thay đổi chưa lưu
            </Badge>
          )}
        </div>
      </div>

      {/* Right side: Action Toolbar */}
      <div className={styles.rightSection}>
        {/* Toggle Grid */}
        <button
          type="button"
          onClick={onToggleGrid}
          className={`${styles.gridBtn} ${showGrid ? styles.gridBtnActive : ""}`}
          title="Bật/Tắt lưới căn chỉnh"
        >
          <Squares2X2Icon className="h-4 w-4" style={{ width: 14, height: 14 }} /> Lưới
        </button>

        {/* Toggle Active Status */}
        <button
          type="button"
          onClick={onToggleActive}
          className={`${styles.statusBtn} ${template.isActive ? styles.statusBtnActive : ""}`}
          title="Nhấp để chuyển nhanh trạng thái giữa Công Khai và Bản Nháp"
        >
          {template.isActive ? (
            <>
              <EyeIcon className="h-4 w-4" style={{ color: "#4ade80", width: 14, height: 14 }} /> 🟢 Công Khai
            </>
          ) : (
            <>
              <EyeSlashIcon className="h-4 w-4" style={{ color: "#cbd5e1", width: 14, height: 14 }} /> ⚪ Bản Nháp
            </>
          )}
        </button>

        {/* Save Draft Button */}
        <button
          type="button"
          onClick={onSaveDraft}
          className={styles.saveDraftBtn}
          title="Lưu nháp bản thiết kế hiện tại"
        >
          <BookmarkIcon className="h-4 w-4" style={{ width: 14, height: 14, color: "#38bdf8" }} /> Lưu Nháp
        </button>

        {/* Publish Button */}
        <button
          type="button"
          onClick={onPublish}
          className={styles.publishBtn}
          title="Xuất bản thiết kế này để khách hàng có thể chọn trên Studio"
        >
          <CloudArrowUpIcon className="h-4 w-4" style={{ width: 14, height: 14 }} /> Xuất bản thiết kế
        </button>

        {/* Toggle Customer Preview */}
        <button
          type="button"
          onClick={onTogglePreview}
          className={`${styles.previewBtn} ${isPreviewMode ? styles.previewBtnActive : ""}`}
          title="Xem thử giao diện tương tác phía khách hàng"
        >
          <EyeIcon className="h-4 w-4" style={{ width: 14, height: 14 }} />
          {isPreviewMode ? "Thoát Xem Thử" : "Xem Thử Khách"}
        </button>
      </div>
    </div>
  );
};
