import React, { useState } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";
import { api } from "../../../../lib/api";
import type { SlotConfig } from "../../types";

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotConfig: SlotConfig;
}

export const SaveDesignModal: React.FC<SaveDesignModalProps> = ({
  isOpen,
  onClose,
  slotConfig,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      await api.submitLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        wedding_date: weddingDate || undefined,
        message: message.trim() ? `[Lưu thiết kế Studio]\n${message.trim()}` : "[Lưu thiết kế Studio]",
        design_snapshot: slotConfig,
      });

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi thiết kế thất bại, thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
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
          backgroundColor: "#1e293b",
          borderRadius: "16px",
          border: "1px solid #38bdf8",
          width: "100%",
          maxWidth: "480px",
          padding: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          color: "#f8fafc",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#38bdf8", margin: 0 }}>
            🚀 Lưu & Đăng Ký Tư Vấn Thiết Kế
          </h3>
          <button
            onClick={onClose}
            style={{ border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle2 size={48} color="#34d399" style={{ margin: "0 auto 12px" }} />
            <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#34d399", marginBottom: "8px" }}>
              Đã gửi thông tin thiết kế thành công!
            </h4>
            <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5 }}>
              Pi Decor đã ghi nhận phối cảnh của bạn. Đội ngũ chuyên viên sẽ liên hệ lại qua SĐT để báo giá chi tiết.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: "16px",
                padding: "8px 20px",
                backgroundColor: "#38bdf8",
                color: "#0f172a",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Hoàn tất
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
              Nhập thông tin của bạn để Pi Decor lưu bản phối cảnh Studio này và liên hệ tư vấn báo giá.
            </p>

            {error && <div style={{ color: "#ef4444", fontSize: "12px" }}>⚠️ {error}</div>}

            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                Họ và tên *
              </label>
              <input
                type="text"
                placeholder="VD: Nguyễn Thu Hà"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                Số điện thoại *
              </label>
              <input
                type="tel"
                placeholder="VD: 0905 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", display: "block", marginBottom: "4px", color: "#cbd5e1" }}>
                Email (Không bắt buộc)
              </label>
              <input
                type="email"
                placeholder="VD: email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", display: "block", marginBottom: "4px", color: "#cbd5e1" }}>
                Ngày tổ chức dự kiến
              </label>
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", display: "block", marginBottom: "4px", color: "#cbd5e1" }}>
                Lời nhắn thêm
              </label>
              <textarea
                placeholder="Yêu cầu bổ sung về hạng mục hay địa điểm..."
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "13px",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#334155",
                  color: "#94a3b8",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#e11d48",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Send size={14} />
                {loading ? "Đang gửi..." : "Gửi thiết kế ngay"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
