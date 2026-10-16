import { quotationsRepository } from "./quotations.repository.js";
import { logger } from "../../config/logger.js";
import { logLeadActivity } from "../../shared/activity.service.js";

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function calculateTotals(items = [], discountInput = 0) {
  const normalizedItems = (Array.isArray(items) ? items : []).map((item) => {
    const qty = Math.max(0, Number(item.quantity ?? 1));
    const price = Math.max(0, Number(item.unit_price ?? 0));
    return {
      description: String(item.description ?? "").trim(),
      quantity: qty,
      unit_price: price,
      subtotal: qty * price,
    };
  });

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = Math.max(0, Number(discountInput ?? 0));
  const total = Math.max(0, subtotal - discount);

  return { items: normalizedItems, subtotal, discount, total };
}

export const quotationsService = {
  async createQuotation(body, adminId) {
    const { lead_id, items, discount, valid_until, notes } = body ?? {};

    if (!lead_id || !Array.isArray(items) || items.length === 0) {
      throw createHttpError(400, "Thiếu lead_id hoặc danh sách hạng mục báo giá (items).");
    }

    const existingLead = await quotationsRepository.findLeadById(lead_id);
    if (!existingLead) {
      throw createHttpError(404, "Không tìm thấy lead tương ứng.");
    }

    const {
      items: calculatedItems,
      subtotal,
      discount: numDiscount,
      total,
    } = calculateTotals(items, discount);

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const quotation_number = await quotationsRepository.generateQuotationNumber();

      const quotationData = {
        lead_id,
        admin_id: adminId ?? null,
        quotation_number,
        items: calculatedItems,
        subtotal,
        discount: numDiscount,
        total,
        status: "draft",
        valid_until: valid_until ?? null,
        notes: notes ?? null,
      };

      try {
        return await quotationsRepository.insert(quotationData);
      } catch (err) {
        if (err.code === "23505" && attempt < maxRetries) {
          logger.warn(
            { quotation_number, attempt },
            `[quotations] Trùng quotation_number, thử lại lần ${attempt + 1}...`
          );
          continue;
        }
        throw err;
      }
    }
  },

  async getQuotations(leadId) {
    const cleanLeadId = leadId ? String(leadId).trim() : null;
    return quotationsRepository.findMany(cleanLeadId);
  },

  async getQuotationById(id) {
    const match = await quotationsRepository.findById(id);
    if (!match) {
      throw createHttpError(404, "Không tìm thấy báo giá.");
    }
    return match;
  },

  async updateQuotation(id, updateData, adminId) {
    const existing = await quotationsRepository.findById(id);
    if (!existing) {
      throw createHttpError(404, "Không tìm thấy báo giá.");
    }

    const patch = { ...updateData };
    const itemsToUse = patch.items !== undefined ? patch.items : existing.items;
    const discountToUse = patch.discount !== undefined ? patch.discount : existing.discount;

    const {
      items: calculatedItems,
      subtotal,
      discount: numDiscount,
      total,
    } = calculateTotals(itemsToUse, discountToUse);

    patch.items = calculatedItems;
    patch.subtotal = subtotal;
    patch.discount = numDiscount;
    patch.total = total;

    const oldStatus = existing.status;
    const updated = await quotationsRepository.updateById(id, patch);

    if (updated && patch.status === "sent" && oldStatus !== "sent") {
      await logLeadActivity({
        leadId: existing.lead_id,
        adminId: adminId ?? null,
        type: "quotation_sent",
        body: `Đã gửi báo giá ${existing.quotation_number} (Tổng: ${total.toLocaleString("vi-VN")} đ)`,
        metadata: { quotation_id: existing.id, quotation_number: existing.quotation_number, total },
      });
    }

    return updated;
  },

  async deleteQuotation(id) {
    const existing = await quotationsRepository.findById(id);
    if (!existing) {
      throw createHttpError(404, "Không tìm thấy báo giá.");
    }

    if (existing.status !== "draft") {
      throw createHttpError(403, "Chỉ được xóa báo giá ở trạng thái nháp (draft).");
    }

    await quotationsRepository.removeById(id);
  },
};
