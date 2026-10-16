import { db } from "../../config/database.js";

export const materialsRepository = {
  async findMany(category, mapped) {
    if (category) {
      return db.query(
        `select * from materials where category = $1 or category = $2 order by created_at asc`,
        [category, mapped]
      );
    }
    return db.query(`select * from materials order by created_at asc`);
  },

  async findDuplicateName(targetName, currentId = null) {
    return db.query(
      `select id from materials where lower(trim(name)) = lower(trim($1)) and ($2::uuid is null or id <> $2::uuid) limit 1`,
      [targetName, currentId]
    );
  },

  async findById(id) {
    return db.findById("materials", id);
  },

  async insert(data) {
    return db.insert("materials", data);
  },

  async updateById(id, patch) {
    return db.updateById("materials", id, patch);
  },

  async removeById(id) {
    return db.removeById("materials", id);
  },
};
