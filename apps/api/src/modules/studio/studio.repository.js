import { db } from "../../config/database.js";

export const studioRepository = {
  // Templates
  async findActiveTemplates() {
    return db.query(
      `select * from studio_templates where is_active = true order by created_at desc`
    );
  },

  async findAllTemplates() {
    return db.query(`select * from studio_templates order by created_at desc`);
  },

  async findTemplateById(id) {
    return db.findById("studio_templates", id);
  },

  async insertTemplate(data) {
    return db.insert("studio_templates", data);
  },

  async updateTemplateById(id, patch) {
    return db.updateById("studio_templates", id, patch);
  },

  async removeTemplateById(id) {
    return db.removeById("studio_templates", id);
  },

  // Slots
  async findSlotsByTemplateId(templateId) {
    return db.query(
      `select * from studio_slot_definitions where template_id = $1 order by sort_order asc`,
      [templateId]
    );
  },

  async removeSlotsByTemplateId(templateId) {
    return db.removeWhere("studio_slot_definitions", "template_id", templateId);
  },

  async insertSlot(data) {
    return db.insert("studio_slot_definitions", data);
  },

  async updateSlotById(id, patch) {
    return db.updateById("studio_slot_definitions", id, patch);
  },

  async removeSlotById(id) {
    return db.removeById("studio_slot_definitions", id);
  },

  // Rules
  async findRulesByTemplateId(templateId) {
    return db.query(
      `select * from studio_slot_rules where template_id = $1 order by priority asc`,
      [templateId]
    );
  },

  async removeRulesByTemplateId(templateId) {
    return db.removeWhere("studio_slot_rules", "template_id", templateId);
  },

  async insertRule(data) {
    return db.insert("studio_slot_rules", data);
  },

  async updateRuleById(id, patch) {
    return db.updateById("studio_slot_rules", id, patch);
  },

  async removeRuleById(id) {
    return db.removeById("studio_slot_rules", id);
  },

  // Assets
  async findActiveAssets() {
    return db.query(`select * from studio_assets where is_active = true order by created_at desc`);
  },

  async findAllAssets() {
    return db.query(`select * from studio_assets order by created_at desc`);
  },

  async findAssetById(id) {
    return db.findById("studio_assets", id);
  },

  async findAssetByNameAndType(name, assetType) {
    const rows = await db.query(
      `select * from studio_assets where name = $1 and asset_type = $2 limit 1`,
      [name, assetType]
    );
    return rows[0] ?? null;
  },

  async insertAsset(data) {
    return db.insert("studio_assets", data);
  },

  async updateAssetById(id, patch) {
    return db.updateById("studio_assets", id, patch);
  },

  async removeAssetById(id) {
    return db.removeById("studio_assets", id);
  },
};
