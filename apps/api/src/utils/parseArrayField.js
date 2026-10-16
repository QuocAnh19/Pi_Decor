/**
 * Chuẩn hóa input dạng mảng, chuỗi JSON hoặc chuỗi CSV phân tách bởi dấu phẩy thành mảng string.
 * @param {unknown} value
 * @returns {string[]}
 */
export function parseArrayField(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // Fallback về tách chuỗi CSV nếu parse JSON không thành công
      }
    }
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}
