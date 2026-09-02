import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  Squares2X2Icon,
  CloudArrowUpIcon,
  BookmarkIcon,
  SparklesIcon,
  ArrowPathIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import type { Template } from "../../types";
import type { StudioTemplateRow } from "../../../../lib/types";
import { Badge, Select } from "../../../../components/ui";
import styles from "./EditorHeader.module.scss";
import { formatDate } from "../../../../lib/formatters";

export interface EditorHeaderProps {
  template: Template;
  allTemplates: StudioTemplateRow[];
  isDirty: boolean;
  showGrid: boolean;
  mode?: "admin" | "customer";
  editingLead?: any;
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(template.name);

  useEffect(() => {
    setEditedName(template.name);
  }, [template.name]);

  const handleSaveName = () => {
    const trimmed = editedName.trim();
    if (trimmed && trimmed !== template.name && onUpdateTemplateName) {
      onUpdateTemplateName(trimmed);
    }
    setIsEditingName(false);
  };

  const handleCancelName = () => {
    setEditedName(template.name);
    setIsEditingName(false);
  };

  const templateOptions =
    allTemplates.length === 0
      ? [
          {
            value: template.id,
            label: isCustomer
              ? template.name
              : `${template.isActive ? "🟢 [Công Khai]" : "⚪ [Bản Nháp]"} ${template.name}`,
          },
        ]
      : (isCustomer
          ? allTemplates.filter((t) => t.is_active)
          : allTemplates
        ).map((t) => ({
          value: t.id,
          label: isCustomer
            ? t.name
            : `${t.is_active ? "🟢 [Công Khai]" : "⚪ [Bản Nháp]"} ${t.name}`,
        }));

  return (
    <div className={styles.header}>
      {/* Left side: Back Button & Template Selector */}
      <div className={styles.leftSection}>
        {editingLead ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Fixed Template Name Tag */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#ffffff",
                border: "1px solid #e7ded0",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "13px",
                fontWeight: "700",
                color: "#271620",
                boxShadow: "0 1px 3px rgba(39, 22, 32, 0.04)",
              }}
            >
              <span style={{ color: "#a15c2e", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: "800" }}>
                Mẫu gốc:
              </span>
              <span>{template.name}</span>
            </div>

            {/* Customer Info Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(161, 92, 46, 0.1)",
                border: "1px solid rgba(161, 92, 46, 0.35)",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: "700",
                color: "#a15c2e",
              }}
            >
              <span>Khách hàng: {editingLead.name}</span>
              <span style={{ color: "rgba(161, 92, 46, 0.4)" }}>•</span>
              <span>{editingLead.phone}</span>
              {editingLead.wedding_date && (
                <>
                  <span style={{ color: "rgba(161, 92, 46, 0.4)" }}>•</span>
                  <span>Tiệc: {formatDate(editingLead.wedding_date)}</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className={styles.backBtn}
              >
                <ArrowLeftIcon className="h-4 w-4" style={{ width: 14, height: 14 }} />{" "}
                {isCustomer ? "Đổi Mẫu Khác" : "Quay lại"}
              </button>
            )}

            <div className={styles.templateGroup}>
              <span className={styles.editingLabel}>
                {isCustomer ? "Mẫu phông cưới:" : "Đang sửa:"}
              </span>

              {!isCustomer ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  {isEditingName ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="text"
                        autoFocus
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          else if (e.key === "Escape") handleCancelName();
                        }}
                        onBlur={handleSaveName}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1.5px solid #a15c2e",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#271620",
                          backgroundColor: "#ffffff",
                          outline: "none",
                          minWidth: "220px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSaveName}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#a15c2e",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        Lưu
                      </button>
                    </div>
                  ) : (
                    <div
                      onDoubleClick={() => {
                        setEditedName(template.name);
                        setIsEditingName(true);
                      }}
                      title="Nhấp đúp chuột để đổi tên mẫu thiết kế này"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: "#fbf7f1",
                        border: "1px dashed #d8cab8",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#a15c2e";
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d8cab8";
                        e.currentTarget.style.backgroundColor = "#fbf7f1";
                      }}
                    >
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#271620" }}>
                        {template.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditedName(template.name);
                          setIsEditingName(true);
                        }}
                        title="Đổi tên mẫu"
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#a15c2e",
                          cursor: "pointer",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  )}

                  {/* Template Switcher Dropdown */}
                  <div style={{ minWidth: "160px" }}>
                    <Select
                      fullWidth={false}
                      value={template.id}
                      onChange={(e) => onSelectTemplate(e.target.value)}
                      options={templateOptions}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ minWidth: "220px" }}>
                  <Select
                    fullWidth={false}
                    value={template.id}
                    onChange={(e) => onSelectTemplate(e.target.value)}
                    options={templateOptions}
                  />
                </div>
              )}

              {!isCustomer && isDirty && (
                <Badge tone="warning">
                  ● Đã thay đổi chưa lưu
                </Badge>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right side: Action Toolbar */}
      <div className={styles.rightSection}>
        {/* Toggle Grid */}
        <button
          type="button"
          onClick={onToggleGrid}
          className={`${styles.gridBtn} ${showGrid ? styles.gridBtnActive : ""}`}
          title="Bật/Tắt lưới căn chỉnh vị trí"
        >
          <Squares2X2Icon className="h-4 w-4" style={{ width: 14, height: 14 }} /> Lưới
        </button>

        {/* Customer: Reset to Original Template */}
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

        {/* If editing a Lead: Show Admin Save Lead Design Button & Back Button */}
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
          /* Normal Customer: Save Design & Get Quote Button */
          isCustomer && onSaveDesign && (
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

        {/* Admin: Toggle Active Status */}
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

        {/* Admin: Save Draft Button */}
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

        {/* Admin: Publish Button */}
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
