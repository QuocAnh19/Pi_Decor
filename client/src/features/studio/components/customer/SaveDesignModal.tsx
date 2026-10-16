import React from "react";
import { Link } from "react-router-dom";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { Input, Textarea } from "../../../../components/ui";
import { useSaveDesignForm } from "../../hooks/useSaveDesignForm";
import type { SlotConfig, SlotDefinition } from "../../types";

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotConfig: SlotConfig;
  templateId?: string;
  templateName?: string;
  slots?: SlotDefinition[];
}

export const SaveDesignModal: React.FC<SaveDesignModalProps> = ({
  isOpen,
  onClose,
  slotConfig,
  templateId = "tpl-classic-01",
  templateName = "Phối cảnh tiệc cưới",
  slots = [],
}) => {
  const {
    name,
    setName,
    phone,
    setPhone,
    email,
    setEmail,
    weddingDate,
    setWeddingDate,
    message,
    setMessage,
    consent,
    setConsent,
    loading,
    error,
    success,
    exportedImageUrl,
    handleSubmit,
    handleManualDownload,
  } = useSaveDesignForm({ slotConfig, templateId, templateName, slots });

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(39, 22, 32, 0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #e7ded0",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "26px",
          boxShadow: "0 25px 60px rgba(39, 22, 32, 0.2)",
          color: "#271620",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "700",
              fontFamily: "'Fraunces', serif",
              color: "#271620",
              margin: 0,
            }}
          >
            {success ? "Lưu Thiết Kế Thành Công" : "Lưu & Nhận Tư Vấn Báo Giá"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Đóng"
            style={{
              border: "none",
              background: "transparent",
              color: "#6e6259",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <CheckCircleIcon
              className="h-12 w-12"
              style={{ margin: "0 auto 10px", color: "#47663b" }}
            />
            <h4
              style={{ fontSize: "16px", fontWeight: "700", color: "#47663b", marginBottom: "6px" }}
            >
              Đã lưu thiết kế &amp; xuất file ảnh thành công!
            </h4>
            <p style={{ fontSize: "13px", color: "#6e6259", lineHeight: 1.5, margin: "0 0 14px" }}>
              File ảnh thiết kế đã tự động tải về thiết bị của bạn (kèm thông tin liên hệ và hotline
              Pi Decor). Chuyên viên sẽ sớm liên hệ qua SĐT <strong>{phone}</strong> để tư vấn chi
              tiết.
            </p>

            {exportedImageUrl && (
              <div
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #e7ded0",
                  boxShadow: "0 4px 16px rgba(39, 22, 32, 0.08)",
                  marginBottom: "16px",
                  backgroundColor: "#0f172a",
                }}
              >
                <img
                  src={exportedImageUrl}
                  alt="Ảnh thiết kế phối cảnh Pi Decor"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "240px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {exportedImageUrl && (
                <button
                  type="button"
                  onClick={handleManualDownload}
                  style={{
                    padding: "11px 20px",
                    backgroundColor: "#a15c2e",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(161, 92, 46, 0.28)",
                  }}
                >
                  <ArrowDownTrayIcon className="h-4 w-4" style={{ width: 18, height: 18 }} />
                  Tải lại file ảnh thiết kế (JPG)
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "9px 20px",
                  backgroundColor: "#fbf7f1",
                  color: "#6e6259",
                  border: "1px solid #e7ded0",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Hoàn tất &amp; Đóng
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <p style={{ fontSize: "12px", color: "#6e6259", margin: 0, lineHeight: 1.4 }}>
              Nhập thông tin liên hệ để Pi Decor lưu bản phối cảnh này và tải ngay 1 file ảnh chất
              lượng cao kèm thông tin hotline về máy.
            </p>

            {error && <div style={{ color: "#b4586b", fontSize: "12px" }}>⚠️ {error}</div>}

            <Input
              id="studio-save-name"
              label="Họ và tên"
              required
              type="text"
              placeholder="VD: Nguyễn Thu Hà"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              id="studio-save-phone"
              label="Số điện thoại"
              required
              type="tel"
              placeholder="VD: 0905 123 456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              id="studio-save-email"
              label="Email (tùy chọn)"
              type="email"
              placeholder="VD: email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              id="studio-save-date"
              label="Ngày tổ chức dự kiến"
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
            />

            <Textarea
              id="studio-save-message"
              label="Lời nhắn thêm"
              placeholder="Yêu cầu bổ sung về ngân sách, tone màu hay địa điểm..."
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div style={{ marginTop: "4px" }}>
              <label
                htmlFor="studio-save-consent"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  fontSize: "12px",
                  color: "#6e6259",
                  cursor: "pointer",
                  lineHeight: "1.4",
                }}
              >
                <input
                  id="studio-save-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  style={{
                    marginTop: "2px",
                    width: "15px",
                    height: "15px",
                    accentColor: "#a15c2e",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <span>
                  Tôi đồng ý để Pi Decor xử lý dữ liệu cá nhân theo{" "}
                  <Link
                    to="/chinh-sach-bao-mat"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#a15c2e", textDecoration: "underline", fontWeight: 600 }}
                  >
                    Chính sách bảo mật
                  </Link>
                  <span style={{ color: "#b4586b", marginLeft: "2px" }}>*</span>
                </span>
              </label>
            </div>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: "9px 18px",
                  backgroundColor: "#fbf7f1",
                  color: "#6e6259",
                  border: "1px solid #e7ded0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "9px 22px",
                  backgroundColor: "#a15c2e",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 8px rgba(161, 92, 46, 0.25)",
                }}
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                {loading ? "Đang xử lý & xuất ảnh..." : "Lưu & Tải Ảnh Thiết Kế"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
