import React, { useState } from "react";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../../../lib/api";
import { Input, Textarea } from "../../../../components/ui";
import { captureStudioThumbnail, generateBrandedDesignImage } from "../../utils/captureThumbnail";
import type { SlotConfig } from "../../types";

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotConfig: SlotConfig;
  templateId?: string;
  templateName?: string;
  slots?: any[];
}

function triggerDownload(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const SaveDesignModal: React.FC<SaveDesignModalProps> = ({
  isOpen,
  onClose,
  slotConfig,
  templateId = "tpl-classic-01",
  templateName = "Phối cảnh tiệc cưới",
  slots = [],
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Vui lòng nhập họ tên và số điện thoại.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let finalPreviewImage: string | undefined = undefined;

      // 1. Capture the latest canvas snapshot reflecting customer edits
      try {
        const rawCaptured = await captureStudioThumbnail();
        if (rawCaptured) {
          // 2. Composite Pi Decor watermark, hotline, and wedding details onto the image
          const branded = await generateBrandedDesignImage(rawCaptured, {
            customerName: name.trim(),
            phone: phone.trim(),
            weddingDate: weddingDate ? String(weddingDate) : "",
            templateName: templateName || "Phối cảnh Tiệc cưới",
            hotline: "0789 241 260",
            website: "pidecor.vn",
            address: "372 Trần Đại Nghĩa, Đà Nẵng",
          });
          finalPreviewImage = branded || rawCaptured;
        }
      } catch (capErr) {
        console.warn("Could not capture or brand customer preview:", capErr);
      }

      setExportedImageUrl(finalPreviewImage || null);

      // 3. Submit lead to database with rich design snapshot
      await api.submitLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        wedding_date: weddingDate || undefined,
        message: message.trim() ? `[Lưu thiết kế Studio]\n${message.trim()}` : "[Lưu thiết kế Studio]",
        design_snapshot: {
          template_id: templateId,
          template_name: templateName,
          slot_config: slotConfig,
          custom_slots: slots,
          ...slotConfig,
          ...(finalPreviewImage ? { preview_image: finalPreviewImage } : {}),
          saved_by: "customer",
          saved_at: new Date().toISOString(),
        },
      });

      // 4. Trigger automatic file download for customer
      if (finalPreviewImage) {
        const sanitizedName = name.trim().replace(/[^a-zA-Z0-9à-ỹÀ-Ỹ_]/g, "_") || "Studio";
        triggerDownload(finalPreviewImage, `PiDecor_ThietKe_${sanitizedName}.jpg`);
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi thiết kế thất bại, thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  const handleManualDownload = () => {
    if (exportedImageUrl) {
      const sanitizedName = name.trim().replace(/[^a-zA-Z0-9à-ỹÀ-Ỹ_]/g, "_") || "Studio";
      triggerDownload(exportedImageUrl, `PiDecor_ThietKe_${sanitizedName}.jpg`);
    }
  };

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", fontFamily: "'Fraunces', serif", color: "#271620", margin: 0 }}>
            {success ? "Lưu Thiết Kế Thành Công" : "Lưu & Nhận Tư Vấn Báo Giá"}
          </h3>
          <button
            onClick={onClose}
            style={{ border: "none", background: "transparent", color: "#6e6259", cursor: "pointer", padding: "4px" }}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <CheckCircleIcon className="h-12 w-12" style={{ margin: "0 auto 10px", color: "#47663b" }} />
            <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#47663b", marginBottom: "6px" }}>
              Đã lưu thiết kế &amp; xuất file ảnh thành công!
            </h4>
            <p style={{ fontSize: "13px", color: "#6e6259", lineHeight: 1.5, margin: "0 0 14px" }}>
              File ảnh thiết kế đã tự động tải về thiết bị của bạn (kèm thông tin liên hệ và hotline Pi Decor). Chuyên viên sẽ sớm liên hệ qua SĐT <strong>{phone}</strong> để tư vấn chi tiết.
            </p>

            {/* Branded Exported Image Preview */}
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
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "12px", color: "#6e6259", margin: 0, lineHeight: 1.4 }}>
              Nhập thông tin liên hệ để Pi Decor lưu bản phối cảnh này và tải ngay 1 file ảnh chất lượng cao kèm thông tin hotline về máy.
            </p>

            {error && <div style={{ color: "#b4586b", fontSize: "12px" }}>⚠️ {error}</div>}

            <Input
              label="Họ và tên"
              required
              type="text"
              placeholder="VD: Nguyễn Thu Hà"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Số điện thoại"
              required
              type="tel"
              placeholder="VD: 0905 123 456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="Email (tùy chọn)"
              type="email"
              placeholder="VD: email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Ngày tổ chức dự kiến"
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
            />

            <Textarea
              label="Lời nhắn thêm"
              placeholder="Yêu cầu bổ sung về ngân sách, tone màu hay địa điểm..."
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
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
