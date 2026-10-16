import { db, pool } from "../../config/database.js";

export const quotationsRepository = {
  async generateQuotationNumber() {
    const currentYear = new Date().getFullYear();
    const { rows } = await pool.query(
      `insert into quotation_counters (year, last_seq)
       values ($1, 1)
       on conflict (year) do update
       set last_seq = quotation_counters.last_seq + 1
       returning last_seq`,
      [currentYear]
    );
    const nextSeq = rows[0].last_seq;
    const seqPadded = String(nextSeq).padStart(4, "0");

    return `BG-${currentYear}-${seqPadded}`;
  },

  async insert(data) {
    return db.insert("quotations", data);
  },

  async findMany(leadId) {
    if (leadId) {
      return db.query(`select * from quotations where lead_id = $1 order by created_at desc`, [
        leadId,
      ]);
    }
    return db.query(`select * from quotations order by created_at desc`);
  },

  async findById(id) {
    return db.findById("quotations", id);
  },

  async findLeadById(leadId) {
    return db.findById("leads", leadId);
  },

  async updateById(id, patch) {
    return db.updateById("quotations", id, patch);
  },

  async removeById(id) {
    return db.removeById("quotations", id);
  },
};
