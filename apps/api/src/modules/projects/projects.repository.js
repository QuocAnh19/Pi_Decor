import { db } from "../../config/database.js";

export const projectsRepository = {
  async findPublished() {
    return db.query(`select * from projects where published = true order by created_at desc`);
  },

  async findAll() {
    return db.query(`select * from projects order by created_at desc`);
  },

  async findById(id) {
    return db.findById("projects", id);
  },

  async insert(projectData) {
    return db.insert("projects", projectData);
  },

  async updateById(id, patch) {
    return db.updateById("projects", id, patch);
  },

  async removeById(id) {
    return db.removeById("projects", id);
  },
};
