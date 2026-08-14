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
