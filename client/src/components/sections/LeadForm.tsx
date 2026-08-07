import { FormEvent, useState } from "react";
import { User, Phone, Mail, Sparkles, Calendar, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api";
import styles from "./LeadForm.module.scss";

type Status = "idle" | "sending" | "success" | "error";

export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const eventType = String(form.get("event_type") ?? "").trim();
    const weddingDate = String(form.get("wedding_date") ?? "").trim();
    const rawMessage = String(form.get("message") ?? "").trim();

    if (!name || !phone) {
      setError("Vui lòng nhập họ tên và số điện thoại.");
      return;
    }

    setStatus("sending");
    setError(null);

    const fullMessage = eventType
      ? `[Loại sự kiện: ${eventType}]${rawMessage ? `\n${rawMessage}` : ""}`
      : rawMessage;

    try {
      await api.submitLead({
        name,
        phone,
        email: email || undefined,
        wedding_date: weddingDate || undefined,
        message: fullMessage || undefined,
      });
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, thử lại sau.");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.successCard}>
        <div className={styles.successIcon}>
          <CheckCircle2 size={32} />
        </div>
        <h3 className={styles.successTitle}>Gửi thông tin thành công!</h3>
        <p className={styles.successText}>
          Cảm ơn bạn đã tin tưởng Pi Decor. Đội ngũ tư vấn sẽ liên hệ lại với bạn trong vòng 24 giờ.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Để lại thông tin tư vấn</h3>
        <p className={styles.formSub}>Pi Decor sẽ gọi điện hỗ trợ bạn lên concept &amp; dự toán chi phí.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Name & Phone Grid */}
        <div className={styles.gridRow}>
          <div className={styles.field}>
            <label className={styles.label}>
              <User size={14} /> Họ và tên *
            </label>
            <input
              name="name"
              type="text"
              placeholder="VD: Nguyễn Văn A"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <Phone size={14} /> Số điện thoại *
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="VD: 0905 123 456"
              required
              className={styles.input}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className={styles.field}>
          <label className={styles.label}>
            <Mail size={14} /> Email <span className={styles.optionalTag}>(Không bắt buộc)</span>
          </label>
          <input
            name="email"
            type="email"
            placeholder="VD: email@example.com"
            className={styles.input}
          />
        </div>

        {/* Event Type Select (Ngay dưới Email) */}
        <div className={styles.field}>
          <label className={styles.label}>
            <Sparkles size={14} /> Loại sự kiện
          </label>
          <select name="event_type" defaultValue="PiWedding — Trang Trí Cưới Hỏi" className={styles.select}>
            <option value="PiWedding — Trang Trí Cưới Hỏi">PiWedding — Trang Trí Cưới Hỏi</option>
            <option value="PiKids — Tiệc Thôi Nôi & Sinh Nhật">PiKids — Tiệc Thôi Nôi &amp; Sinh Nhật</option>
            <option value="PiEvent — Sự Kiện & Doanh Nghiệp">PiEvent — Sự Kiện &amp; Doanh Nghiệp</option>
            <option value="Khác">Loại sự kiện khác</option>
          </select>
        </div>

        {/* Expected Event Date Field (Chọn ngày dự kiến) */}
        <div className={styles.field}>
          <label className={styles.label}>
            <Calendar size={14} /> Chọn ngày tổ chức dự kiến
          </label>
          <input
            name="wedding_date"
            type="date"
            aria-label="Chọn ngày tổ chức dự kiến"
            className={styles.input}
          />
        </div>

        {/* Message Field */}
        <div className={styles.field}>
          <label className={styles.label}>
            <MessageSquare size={14} /> Ý tưởng hoặc ghi chú thêm <span className={styles.optionalTag}>(Không bắt buộc)</span>
          </label>
          <textarea
            name="message"
            placeholder="VD: Mong muốn tông màu pastel, tiệc ngoài trời, khoảng 200 khách..."
            rows={3}
            className={styles.textarea}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={status === "sending"} className={styles.submitBtn}>
          <Send size={15} />
          {status === "sending" ? "Đang gửi thông tin…" : "Gửi Đăng Ký Tư Vấn"}
        </button>
      </form>
    </div>
  );
}
