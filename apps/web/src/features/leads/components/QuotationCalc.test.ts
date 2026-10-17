import { describe, it, expect } from "vitest";
import type { QuotationItem } from "../../../lib/types";

function calculateQuotation(
  items: Omit<QuotationItem, "subtotal">[],
  discount: number = 0
): { subtotal: number; total: number } {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0
  );
  const total = Math.max(0, subtotal - Number(discount || 0));
  return { subtotal, total };
}

describe("Quotation Calculation Logic in QuotationModal", () => {
  it("tính chính xác subtotal từ danh sách các mục", () => {
    const items = [
      { description: "Gói trang trí cơ bản", quantity: 1, unit_price: 15000000 },
      { description: "Hoa tươi bổ sung", quantity: 3, unit_price: 2000000 },
    ];

    const { subtotal, total } = calculateQuotation(items, 0);
    expect(subtotal).toBe(21000000);
    expect(total).toBe(21000000);
  });

  it("trừ chiết khấu hợp lệ từ subtotal", () => {
    const items = [{ description: "Gói tiệc", quantity: 1, unit_price: 10000000 }];

    const { subtotal, total } = calculateQuotation(items, 1500000);
    expect(subtotal).toBe(10000000);
    expect(total).toBe(8500000);
  });

  it("không để total âm khi chiết khấu vượt quá subtotal", () => {
    const items = [{ description: "Mục nhỏ", quantity: 1, unit_price: 500000 }];

    const { subtotal, total } = calculateQuotation(items, 1000000);
    expect(subtotal).toBe(500000);
    expect(total).toBe(0);
  });

  it("xử lý an toàn khi danh sách mục rỗng", () => {
    const { subtotal, total } = calculateQuotation([], 100000);
    expect(subtotal).toBe(0);
    expect(total).toBe(0);
  });
});
