import type { TestimonialItem, TestimonialPayload } from "../types";

/**
 * Chuẩn hóa đối tượng TestimonialItem từ API.
 */
export function normalizeTestimonial(row: TestimonialItem): TestimonialItem {
  return {
    ...row,
    rating: Number(row.rating ?? 5),
    photos: Array.isArray(row.photos) ? row.photos : [],
  };
}

/**
 * Đóng gói dữ liệu đánh giá thành TestimonialPayload (snake_case).
 */
export function toTestimonialPayload(input: {
  author: string;
  role?: string;
  quote: string;
  rating?: number;
  photos?: string[];
  leadId?: string;
}): TestimonialPayload {
  return {
    author: input.author.trim(),
    role: input.role?.trim() || undefined,
    quote: input.quote.trim(),
    rating: input.rating ?? 5,
    photos: input.photos ?? [],
    lead_id: input.leadId,
  };
}
