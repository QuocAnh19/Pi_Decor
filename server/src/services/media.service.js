import { deleteMultipleImageFiles } from "../utils/uploadImage.js";

/**
 * Chuẩn hóa một giá trị (URL string, mảng, hoặc chuỗi JSON mảng) thành danh sách string URL.
 * @param {unknown} val
 * @returns {string[]}
 */
function toUrlList(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.filter((item) => typeof item === "string" && item.trim()).map((s) => s.trim());
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => typeof item === "string" && item.trim()).map((s) => s.trim());
        }
      } catch {
        // Fallback xử lý như chuỗi đơn nếu parse JSON không thành công
      }
    }
    return [trimmed];
  }
  return [];
}

/**
 * Xóa các file ảnh có trong danh sách cũ (oldList) nhưng không còn xuất hiện trong danh sách mới (newList).
 * Hỗ trợ nhận cả URL đơn lẻ (string) hoặc danh sách URLs (array/JSON string).
 *
 * @param {unknown} oldList
 * @param {unknown} newList
 * @returns {Promise<void>}
 */
export async function cleanupRemovedMedia(oldList, newList) {
  const oldUrls = toUrlList(oldList);
  if (oldUrls.length === 0) return;

  const newUrls = new Set(toUrlList(newList));
  const removed = oldUrls.filter((url) => !newUrls.has(url));

  if (removed.length > 0) {
    await deleteMultipleImageFiles(removed);
  }
}

/**
 * Thu dọn toàn bộ tài nguyên hình ảnh của một thực thể (dự án, địa điểm, dịch vụ, đánh giá, v.v.).
 * Tự động trích xuất các URLs từ các trường được chỉ định.
 *
 * @param {Record<string, any>|null} entity
 * @param {...string} fields - Các trường cần thu dọn (mặc định gom các trường ảnh thông dụng)
 * @returns {Promise<void>}
 */
export async function deleteMediaOf(entity, ...fields) {
  if (!entity || typeof entity !== "object") return;

  const targetFields = fields.length > 0
    ? fields
    : ["cover_image", "cover", "image_url", "gallery", "photos", "thumbnail", "avatar_url"];

  const urlsToDelete = [];

  for (const field of targetFields) {
    const val = entity[field];
    if (!val) continue;

    // Riêng trường icon của services có thể là tên biểu tượng (như 'HeartIcon') thay vì URL
    if (field === "icon") {
      if (typeof val === "string" && val.startsWith("http")) {
        urlsToDelete.push(val.trim());
      }
      continue;
    }

    const extracted = toUrlList(val);
    urlsToDelete.push(...extracted);
  }

  if (urlsToDelete.length > 0) {
    await deleteMultipleImageFiles(urlsToDelete);
  }
}
