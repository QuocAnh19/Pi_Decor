import React from "react";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  Squares2X2Icon,
  CloudArrowUpIcon,
  BookmarkIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { Template } from "../../types";
import type { StudioTemplateRow, Lead } from "../../../../lib/types";
import { EditorHeaderLeftSection } from "./EditorHeaderLeftSection";
import styles from "./EditorHeader.module.scss";

export interface EditorHeaderProps {
  template: Template;
  allTemplates: StudioTemplateRow[];
  isDirty: boolean;
  showGrid: boolean;
  mode?: "admin" | "customer";
  editingLead?: Lead | null;
  onBackToHome?: () => void;
  onSelectTemplate: (templateId: string) => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onToggleActive?: () => void;
  onToggleGrid: () => void;
  onSaveDesign?: () => void;
  onReset?: () => void;
  onUpdateTemplateName?: (newName: string) => void;
  onAdminSaveLeadDesign?: () => void;
  onBackToLeads?: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  template,
  allTemplates,
  isDirty,
  showGrid,
  mode = "admin",
  editingLead,
  onBackToHome,
  onSelectTemplate,
  onSaveDraft,
  onPublish,
  onToggleActive,
  onToggleGrid,
  onSaveDesign,
  onReset,
  onUpdateTemplateName,
  onAdminSaveLeadDesign,
  onBackToLeads,
}) => {
  const isCustomer = mode === "customer";

  return (
    <div className={styles.header}>
      <EditorHeaderLeftSection
        template={template}
        allTemplates={allTemplates}
        isDirty={isDirty}
        isCustomer={isCustomer}
        editingLead={editingLead}
        onBackToHome={onBackToHome}
        onSelectTemplate={onSelectTemplate}
        onUpdateTemplateName={onUpdateTemplateName}
      />

      {/* Right side: Action Toolbar */}
      <div className={styles.rightSection}>
        <button
          type="button"
          onClick={onToggleGrid}
          className={`${styles.gridBtn} ${showGrid ? styles.gridBtnActive : ""}`}
          title="Bật/Tắt lưới căn chỉnh vị trí"
        >
          <Squares2X2Icon className="h-4 w-4" style={{ width: 14, height: 14 }} /> Lưới
        </button>

        {isCustomer && onReset && (
          <button
            type="button"
            onClick={onReset}
            className={styles.saveDraftBtn}
            title="Khôi phục lại toàn bộ màu sắc và vật liệu mặc định của mẫu này"
          >
            <ArrowPathIcon className="h-4 w-4" style={{ width: 14, height: 14 }} /> Đặt Lại Gốc
          </button>
        )}

        {editingLead ? (
          <>
            {onBackToLeads && (
              <button
                type="button"
                onClick={onBackToLeads}
                className={styles.saveDraftBtn}
                title="Quay lại danh sách khách hàng"
              >
                <ArrowLeftIcon className="h-4 w-4" style={{ width: 14, height: 14 }} /> Quay lại Leads
              </button>
            )}
            {onAdminSaveLeadDesign && (
              <button
                type="button"
                onClick={onAdminSaveLeadDesign}
                className={styles.publishBtn}
                title="Lưu bản phối cảnh vừa tinh chỉnh cho khách hàng này"
                style={{
                  backgroundColor: "#a15c2e",
                  color: "#ffffff",
                  boxShadow: "0 4px 14px rgba(161, 92, 46, 0.3)",
                }}
              >
                <BookmarkIcon className="h-4 w-4" style={{ width: 16, height: 16 }} /> Lưu Cho Khách Hàng
              </button>
            )}
          </>
        ) : (
          isCustomer &&
          onSaveDesign && (
            <button
              type="button"
              onClick={onSaveDesign}
              className={styles.publishBtn}
              title="Lưu thiết kế của bạn và gửi yêu cầu tư vấn báo giá"
              style={{
                backgroundColor: "#a15c2e",
                color: "#ffffff",
                boxShadow: "0 4px 14px rgba(161, 92, 46, 0.3)",
              }}
            >
              <SparklesIcon className="h-4 w-4" style={{ width: 16, height: 16 }} /> Lưu Thiết Kế &amp; Báo Giá
            </button>
          )
        )}

        {!isCustomer && onToggleActive && (
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
        )}

        {!isCustomer && onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            className={styles.saveDraftBtn}
            title="Lưu nháp bản thiết kế hiện tại và cập nhật ảnh đại diện"
          >
            <BookmarkIcon className="h-4 w-4" style={{ width: 14, height: 14, color: "#38bdf8" }} /> Lưu Nháp
          </button>
        )}

        {!isCustomer && onPublish && (
          <button
            type="button"
            onClick={onPublish}
            className={styles.publishBtn}
            title="Xuất bản thiết kế và cập nhật ảnh đại diện lên Studio"
          >
            <CloudArrowUpIcon className="h-4 w-4" style={{ width: 14, height: 14 }} /> Xuất bản thiết kế
          </button>
        )}
      </div>
    </div>
  );
};
