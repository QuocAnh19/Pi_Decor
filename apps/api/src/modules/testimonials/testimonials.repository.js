import { db } from "../../config/database.js";

export const testimonialsRepository = {
  async findApproved() {
    return db.query(
      `select id, author, role, quote, rating, photos, created_at, updated_at
       from testimonials
       where status = 'approved'
       order by created_at desc`
    );
  },

  async findAll(status) {
    if (status) {
      return db.query(`select * from testimonials where status = $1 order by created_at desc`, [
        String(status).trim(),
      ]);
    }
    return db.query(`select * from testimonials order by created_at desc`);
  },

  async findById(id) {
    return db.findById("testimonials", id);
  },

  async insert(data) {
    return db.insert("testimonials", data);
  },

  async updateById(id, patch) {
    return db.updateById("testimonials", id, patch);
  },

  async removeById(id) {
    return db.removeById("testimonials", id);
  },
};
