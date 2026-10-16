import type { Venue, VenuePayload } from "../types";

/**
 * Chuẩn hóa đối tượng Venue từ API đảm bảo lat/lng và project_count luôn là kiểu số hợp lệ.
 */
export function normalizeVenue(row: Venue): Venue {
  return {
    ...row,
    lat: Number(row.lat),
    lng: Number(row.lng),
    project_count: Number(row.project_count ?? 0),
  };
}

/**
 * Đóng gói dữ liệu form địa điểm sang VenuePayload (snake_case).
 */
export function toVenuePayload(input: {
  name: string;
  type: Venue["type"];
  address?: string | null;
  city?: string | null;
  lat: number;
  lng: number;
  coverImage?: string | null;
}): VenuePayload {
  return {
    name: input.name.trim(),
    type: input.type,
    address: input.address?.trim() || null,
    city: input.city?.trim() || null,
    lat: Number(input.lat),
    lng: Number(input.lng),
    cover_image: input.coverImage ?? null,
  };
}
