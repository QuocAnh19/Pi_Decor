import React from "react";
import { CheckCircleIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface SaveDesignSuccessViewProps {
  phone: string;
  exportedImageUrl: string | null;
  onManualDownload: () => void;
  onClose: () => void;
}

export const SaveDesignSuccessView: React.FC<SaveDesignSuccessViewProps> = ({
  phone,
  exportedImageUrl,
  onManualDownload,
  onClose,
}) => {
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <CheckCircleIcon className="h-12 w-12" style={{ margin: "0 auto 10px", color: "#47663b" }} />
      <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#47663b", marginBottom: "6px" }}>
        Đã lưu thiết kế &amp; xuất file ảnh thành công!
      </h4>
      <p style={{ fontSize: "13px", color: "#6e6259", lineHeight: 1.5, margin: "0 0 14px" }}>
        File ảnh thiết kế đã tự động tải về thiết bị của bạn (kèm thông tin liên hệ và hotline Pi
        Decor). Chuyên viên sẽ sớm liên hệ qua SĐT <strong>{phone}</strong> để tư vấn chi tiết.
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
            onClick={onManualDownload}
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
  );
};
