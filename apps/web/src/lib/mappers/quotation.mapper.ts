import type { Quotation, QuotationItem, QuotationPayload } from "../types";

/**
 * Chuẩn hóa đối tượng Quotation từ API đảm bảo các trường tiền tệ là kiểu số.
 */
export function normalizeQuotation(row: Quotation): Quotation {
  const items: QuotationItem[] = Array.isArray(row.items)
    ? row.items.map((item) => ({
        description: String(item.description ?? ""),
        quantity: Number(item.quantity ?? 0),
        unit_price: Number(item.unit_price ?? 0),
        subtotal: Number(
          item.subtotal ?? Number(item.quantity ?? 0) * Number(item.unit_price ?? 0)
        ),
      }))
    : [];

  return {
    ...row,
    items,
    subtotal: Number(row.subtotal ?? 0),
    discount: Number(row.discount ?? 0),
    total: Number(row.total ?? 0),
  };
}

/**
 * Đóng gói dữ liệu báo giá thành QuotationPayload (snake_case).
 */
export function toQuotationPayload(input: {
  leadId: string;
  items: Omit<QuotationItem, "subtotal">[];
  discount?: number;
  validUntil?: string | null;
  notes?: string | null;
}): QuotationPayload {
  return {
    lead_id: input.leadId,
    items: input.items.map((item) => ({
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
    })),
    discount: Number(input.discount ?? 0),
    valid_until: input.validUntil || null,
    notes: input.notes?.trim() || null,
  };
}
