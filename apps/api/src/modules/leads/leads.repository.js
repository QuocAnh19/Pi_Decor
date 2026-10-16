import { db } from "../../config/database.js";

function escapeLike(str) {
  return str.replace(/[%_\\]/g, "\\$&");
}

export const leadsRepository = {
  async insert(leadData) {
    return db.insert("leads", leadData);
  },

  async findMany({ q, status, page = 1, limit = 20 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const values = [];

    if (q && typeof q === "string" && q.trim()) {
      const escaped = escapeLike(q.trim().toLowerCase());
      const term = `%${escaped}%`;
      values.push(term, term, term);
      conditions.push(
        `(lower(name) like $${values.length - 2} OR lower(phone) like $${values.length - 1} OR lower(coalesce(email,'')) like $${values.length})`
      );
    }

    if (status && status !== "all") {
      values.push(status.trim());
      conditions.push(`status = $${values.length}`);
    }

    const whereStr = conditions.length ? `where ${conditions.join(" and ")}` : "";

    const [{ n: total }] = await db.query(
      `select count(*)::int as n from leads ${whereStr}`,
      values
    );

    const data = await db.query(
      `select * from leads ${whereStr}
       order by created_at desc
       limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, limitNum, offset]
    );

    return { data, total, page: pageNum, limit: limitNum };
  },

  async findById(id) {
    return db.findById("leads", id);
  },

  async findActivities(leadId) {
    return db.query(`select * from lead_activities where lead_id = $1 order by created_at desc`, [
      leadId,
    ]);
  },

  async updateById(id, patch) {
    return db.updateById("leads", id, patch);
  },
};
