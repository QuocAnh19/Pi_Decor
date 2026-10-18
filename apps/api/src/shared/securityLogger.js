import { logger } from "../config/logger.js";

/**
 * Ghi nhật ký cấu trúc (structured audit log) cho các sự kiện bảo mật trọng yếu.
 * Tuyệt đối không bao giờ ghi mật khẩu gốc, token thô, hoặc dữ liệu nhạy cảm.
 *
 * @param {string} event - Tên định danh sự kiện bảo mật chuẩn
 * @param {object} details - Dữ liệu ngữ cảnh không nhạy cảm (email, admin_id, ip,...)
 * @param {string} msg - Thông điệp mô tả sự kiện bằng tiếng Việt
 */
export function logSecurityEvent(event, details = {}, msg = "") {
  logger.warn(
    {
      security_audit: true,
      event,
      timestamp: new Date().toISOString(),
      ...details,
    },
    `[SECURITY_AUDIT] ${msg || event}`
  );
}
