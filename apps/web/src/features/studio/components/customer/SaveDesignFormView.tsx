import React from "react";
import { Link } from "react-router-dom";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Input, Textarea } from "../../../../components/ui";

interface SaveDesignFormViewProps {
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  weddingDate: string;
  setWeddingDate: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const SaveDesignFormView: React.FC<SaveDesignFormViewProps> = ({
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
  onSubmit,
  onClose,
}) => {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <p style={{ fontSize: "12px", color: "#6e6259", margin: 0, lineHeight: 1.4 }}>
        Nhập thông tin liên hệ để Pi Decor lưu bản phối cảnh này và tải ngay 1 file ảnh chất lượng
        cao kèm thông tin hotline về máy.
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
  );
};
