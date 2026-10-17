/**
 * Centralized formatting utilities for date, time, and currency.
 */

/**
 * Format ISO date string or Date object to Vietnam locale date (dd/mm/yyyy).
 */
export function formatDate(iso?: string | Date | null): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format ISO date string to Vietnam datetime string (dd/mm/yyyy, hh:mm).
 */
export function formatDateTime(iso?: string | Date | null): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format wedding date with weekday (vd: Thứ Bảy, 15/10/2026).
 */
export function formatWeddingDate(dateStr?: string | null): string {
  if (!dateStr) return "Chưa chọn ngày cụ thể";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format currency amount to Vietnamese Dong string (vd: 15.000.000 đ).
 */
export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 đ";
  return `${amount.toLocaleString("vi-VN")} đ`;
}

/**
 * Format ISO date string hoặc Date object sang thời gian tương đối tiếng Việt
 * (vd: "vừa xong", "5 phút trước", "2 giờ trước", "3 ngày trước").
 */
export function formatRelativeTime(iso?: string | Date | null): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return "—";

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "vừa xong";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "vừa xong";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} tháng trước`;

  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear} năm trước`;
}
