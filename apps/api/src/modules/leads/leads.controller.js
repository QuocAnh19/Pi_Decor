import { leadsService } from "./leads.service.js";

export const leadsController = {
  async createLead(req, res) {
    const created = await leadsService.createLead(req.body);
    res.status(201).json({ id: created.id });
  },

  async getLeads(req, res) {
    const result = await leadsService.getLeads(req.query);
    res.json(result);
  },

  async getLeadById(req, res) {
    const lead = await leadsService.getLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Không tìm thấy lead." });
    }
    res.json(lead);
  },

  async getLeadActivities(req, res) {
    const activities = await leadsService.getLeadActivities(req.params.id);
    if (!activities) {
      return res.status(404).json({ message: "Không tìm thấy lead." });
    }
    res.json(activities);
  },

  async addLeadActivity(req, res) {
    const activity = await leadsService.addLeadActivity(req.params.id, req.body, req.user?.sub);
    if (!activity) {
      return res.status(404).json({ message: "Không tìm thấy lead." });
    }
    res.status(201).json(activity);
  },

  async updateLead(req, res) {
    const updated = await leadsService.updateLead(req.params.id, req.body, req.user?.sub);
    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy lead." });
    }
    res.json(updated);
  },
};
