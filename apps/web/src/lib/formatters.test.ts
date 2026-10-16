import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime, formatWeddingDate, formatCurrency } from "./formatters";

describe("formatters utilities", () => {
  it("formatDate trả về chuỗi ngày dd/mm/yyyy chuẩn Việt Nam", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("invalid-date")).toBe("—");

    const formatted = formatDate("2026-10-15T00:00:00Z");
    expect(formatted).toMatch(/15\/10\/2026/);
  });

  it("formatDateTime trả về chuỗi ngày giờ chuẩn Việt Nam", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime("invalid")).toBe("—");

    const formatted = formatDateTime("2026-10-15T14:30:00Z");
    expect(formatted).toContain("15/10/2026");
  });

  it("formatWeddingDate trả về thứ ngày tháng năm", () => {
    expect(formatWeddingDate(null)).toBe("Chưa chọn ngày cụ thể");
    expect(formatWeddingDate("")).toBe("Chưa chọn ngày cụ thể");

    const result = formatWeddingDate("2026-10-15");
    expect(result).toContain("2026");
    expect(result).toContain("10");
    expect(result).toContain("15");
  });

  it("formatCurrency định dạng số tiền VND chuẩn kèm ký hiệu đ", () => {
    expect(formatCurrency(null)).toBe("0 đ");
    expect(formatCurrency(undefined)).toBe("0 đ");
    expect(formatCurrency(0)).toBe("0 đ");

    const formatted = formatCurrency(15000000);
    // 15.000.000 đ hoặc 15,000,000 đ tùy locale OS
    expect(formatted).toMatch(/15[.,]000[.,]000\s*đ/);
  });
});
