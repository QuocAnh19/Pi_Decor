import { FormEvent, useState } from "react";
import { api } from "../../lib/api";
import { Button } from "../ui/Button";
import styles from "./LeadForm.module.scss";

type Status = "idle" | "sending" | "success" | "error";

/**
 * The functional replacement for "khách vẫn phải rời trang qua Zalo/hotline"
 * (Mục 1.1 of the technical proposal) — a real form that saves to the
 * backend's `leads` table instead of just displaying contact info.
 */
export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    if (!name || !phone) {
      setError("Vui lòng nhập tên và số điện thoại.");
      return;
    }

    setStatus("sending");
    setError(null);
    try {
      await api.submitLead({
        name,
        phone,
        email: String(form.get("email") ?? "") || undefined,
        wedding_date: String(form.get("wedding_date") ?? "") || undefined,
        message: String(form.get("message") ?? "") || undefined,
      });
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, thử lại sau.");
    }
  }

  if (status === "success") {
    return <div className={styles.success}>✓ Cảm ơn bạn! Đội tư vấn Pi Decor sẽ liên hệ trong 24h.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input name="name" placeholder="Họ tên" required className={styles.input} />
      <input name="phone" placeholder="Số điện thoại" required className={styles.input} />
      <input name="email" type="email" placeholder="Email (không bắt buộc)" className={styles.input} />
      <input name="wedding_date" type="date" aria-label="Ngày cưới dự kiến" className={styles.input} />
      <textarea
        name="message"
        placeholder="Bạn muốn tư vấn về điều gì?"
        rows={3}
        className={styles.textarea}
      />

      {error && <p className={styles.error}>{error}</p>}

      <Button type="submit" disabled={status === "sending"} className={styles.submit}>
        {status === "sending" ? "Đang gửi…" : "Gửi thông tin"}
      </Button>
    </form>
  );
}
