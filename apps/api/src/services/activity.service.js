import { db } from "../config/database.js";
import { logger } from "../config/logger.js";

/**
 * Ghi nhận một sự kiện vào dòng thời gian của Lead (lead_activities).
 * Bảng lead_activities có default id (gen_random_uuid()) và created_at (now()).
 * Bắt lỗi tại đây để việc ghi log không bao giờ làm hỏng request chính.
 *
 * @param {Object} params
 * @param {string} params.leadId - ID của lead
 * @param {string|null} [params.adminId=null] - ID của admin thao tác
 * @param {string} params.type - Loại hoạt động ('status_change' | 'note' | 'call' | 'email' | 'quotation_sent' | 'design_saved')
 * @param {string|null} [params.body=null] - Nội dung ghi chú
 * @param {Record<string, any>|null} [params.metadata=null] - Dữ liệu mở rộng
 * @returns {Promise<Record<string, any>|null>}
 */
export async function logLeadActivity({
  leadId,
  adminId = null,
  type,
  body = null,
  metadata = null,
}) {
  try {
    const activity = await db.insert("lead_activities", {
      lead_id: leadId,
      admin_id: adminId,
      activity_type: type,
      body,
      metadata,
    });
    return activity;
  } catch (err) {
    logger.warn(
      { err: err.message, leadId, type },
      "Không thể ghi lead_activity (tiếp tục luồng request)"
    );
    return null;
  }
}
