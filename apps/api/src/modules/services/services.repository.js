import { db } from "../../config/database.js";

export const servicesRepository = {
  async findAll() {
    return db.get("services");
  },

  async findById(id) {
    return db.findById("services", id);
  },

  async insert(data) {
    return db.insert("services", data);
  },

  async updateById(id, patch) {
    return db.updateById("services", id, patch);
  },

  async removeById(id) {
    return db.removeById("services", id);
  },
};
