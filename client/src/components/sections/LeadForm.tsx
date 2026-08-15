import { FormEvent, useState } from "react";
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  SparklesIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../lib/api";
import { Input, Select, Textarea } from "../ui";
import styles from "./LeadForm.module.scss";

type Status = "idle" | "sending" | "success" | "error";

const EVENT_TYPE_OPTIONS = [
  { value: "PiWedding — Trang Trí Cưới Hỏi", label: "PiWedding — Trang Trí Cưới Hỏi" },
  { value: "PiKids — Tiệc Thôi Nôi & Sinh Nhật", label: "PiKids — Tiệc Thôi Nôi & Sinh Nhật" },
  { value: "PiEvent — Sự Kiện & Doanh Nghiệp", label: "PiEvent — Sự Kiện & Doanh Nghiệp" },
  { value: "Khác", label: "Loại sự kiện khác" },
];

export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget; // lưu tham chiếu trước await
    const form = new FormData(formEl);
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
      formEl.reset();
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra, thử lại sau.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className={styles.successCard}>
        <div className={styles.successIcon}>
          <CheckCircleIcon className="h-8 w-8" style={{ width: 32, height: 32 }} />
        </div>
        <h3 className={styles.successTitle}>Gửi thông tin thành công!</h3>
        <p className={styles.successText}>
          Cảm ơn bạn đã tin tưởng Pi Decor. Đội ngũ tư vấn sẽ liên hệ lại với
          bạn trong vòng 24 giờ.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Để lại thông tin tư vấn</h3>
        <p className={styles.formSub}>
          Pi Decor sẽ liên hệ hỗ trợ bạn lên concept &amp; dự toán chi phí.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Name & Phone Grid */}
        <div className={styles.gridRow}>
          <Input
            name="name"
            type="text"
            label={
              <span className={styles.labelSpan}>
                <UserIcon className="h-3.5 w-3.5 inline" style={{ width: 14, height: 14 }} /> Họ và tên
              </span>
            }
            placeholder="VD: Nguyễn Văn A"
            required
          />

          <Input
            name="phone"
            type="tel"
            label={
              <span className={styles.labelSpan}>
                <PhoneIcon className="h-3.5 w-3.5 inline" style={{ width: 14, height: 14 }} /> Số điện thoại
              </span>
            }
            placeholder="VD: 0905 123 456"
            required
          />
        </div>

        {/* Email Field */}
        <Input
          name="email"
          type="email"
          label={
            <span className={styles.labelSpan}>
              <EnvelopeIcon className="h-3.5 w-3.5 inline" style={{ width: 14, height: 14 }} /> Email{" "}
              {/* <span className={styles.optionalTag}>(Không bắt buộc)</span> */}
            </span>
          }
          placeholder="VD: email@example.com"
        />

        {/* Event Type Select */}
        <Select
          name="event_type"
          label={
            <span className={styles.labelSpan}>
              <SparklesIcon className="h-3.5 w-3.5 inline" style={{ width: 14, height: 14 }} /> Loại sự kiện
            </span>
          }
          defaultValue="PiWedding — Trang Trí Cưới Hỏi"
          options={EVENT_TYPE_OPTIONS}
        />

        {/* Expected Event Date Field */}
        <Input
          name="wedding_date"
          type="date"
          label={
            <span className={styles.labelSpan}>
              <CalendarIcon className="h-3.5 w-3.5 inline" style={{ width: 14, height: 14 }} /> Chọn ngày tổ chức dự kiến
            </span>
          }
          aria-label="Chọn ngày tổ chức dự kiến"
        />

        {/* Message Field */}
        <Textarea
          name="message"
          label={
            <span className={styles.labelSpan}>
              <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 inline" style={{ width: 14, height: 14 }} /> Ý tưởng hoặc ghi chú thêm{" "}
              {/* <span className={styles.optionalTag}>(Không bắt buộc)</span> */}
            </span>
          }
          placeholder="VD: Mong muốn tông màu pastel, tiệc ngoài trời, khoảng 200 khách..."
          rows={3}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={status === "sending"}
          className={styles.submitBtn}
        >
          <PaperAirplaneIcon className="h-4 w-4 inline mr-1" style={{ display: 'inline', width: 16, height: 16 }} />
          {status === "sending" ? "Đang gửi thông tin…" : "Gửi Đăng Ký Tư Vấn"}
        </button>
      </form>
    </div>
  );
}
