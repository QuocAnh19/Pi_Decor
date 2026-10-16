import { leadsRepository } from "./leads.repository.js";
import { logLeadActivity } from "../../shared/activity.service.js";

export const leadsService = {
  async createLead(body) {
    const { name, phone, email, wedding_date, message, design_snapshot, consent_version } =
      body ?? {};

    const cleanEmail = email && typeof email === "string" && email.trim() ? email.trim() : null;
    const cleanDate =
      wedding_date && typeof wedding_date === "string" && wedding_date.trim()
        ? wedding_date.trim()
        : null;
    const cleanMessage =
      message && typeof message === "string" && message.trim() ? message.trim() : null;

    const leadData = {
      name: typeof name === "string" ? name.trim() : name,
      phone: typeof phone === "string" ? phone.trim() : phone,
      email: cleanEmail,
      wedding_date: cleanDate,
      message: cleanMessage,
      design_snapshot: design_snapshot ?? null,
      status: "new",
      consent_at: new Date(),
      consent_version: typeof consent_version === "string" ? consent_version.trim() : "v1.0",
    };

    return leadsRepository.insert(leadData);
  },

  async getLeads(query) {
    return leadsRepository.findMany(query);
  },

  async getLeadById(id) {
    return leadsRepository.findById(id);
  },

  async getLeadActivities(leadId) {
    const existing = await leadsRepository.findById(leadId);
    if (!existing) return null;
    return leadsRepository.findActivities(leadId);
  },

  async addLeadActivity(leadId, { activity_type, body }, adminId) {
    const existing = await leadsRepository.findById(leadId);
    if (!existing) return null;

    return logLeadActivity({
      leadId,
      adminId: adminId ?? null,
      type: activity_type,
      body: body ?? null,
    });
  },

  async updateLead(id, patch, adminId) {
    const existing = await leadsRepository.findById(id);
    if (!existing) return null;

    if (Object.keys(patch).length === 0) {
      return existing;
    }

    const updated = await leadsRepository.updateById(id, patch);

    if (patch.status && existing.status !== patch.status) {
      await logLeadActivity({
        leadId: id,
        adminId: adminId ?? null,
        type: "status_change",
        body: `Trạng thái chuyển từ "${existing.status}" sang "${patch.status}"`,
        metadata: { from: existing.status, to: patch.status },
      });
    }

    if (patch.design_snapshot) {
      await logLeadActivity({
        leadId: id,
        adminId: adminId ?? null,
        type: "note",
        body: "Admin đã tinh chỉnh & cập nhật bản phối cảnh Studio cho khách hàng",
        metadata: { updated_by: "admin" },
      });
    }

    return updated;
  },
};
