import { db } from "../../config/database.js";

export const venuesRepository = {
  async findMany(city) {
    let sql = `
      select v.*, coalesce(p.project_count, 0)::int as project_count
      from venues v
      left join (
        select venue_id, count(*)::int as project_count
        from projects
        where published = true
        group by venue_id
      ) p on p.venue_id = v.id
    `;
    const values = [];
    if (city) {
      values.push(String(city).trim().toLowerCase());
      sql += ` where lower(v.city) = $1`;
    }
    sql += ` order by v.created_at asc`;
    return db.query(sql, values);
  },

  async search(term) {
    const sql = `
      select v.*, coalesce(p.project_count, 0)::int as project_count
      from venues v
      left join (
        select venue_id, count(*)::int as project_count
        from projects
        where published = true
        group by venue_id
      ) p on p.venue_id = v.id
      where (lower(v.name) like $1 or lower(coalesce(v.city,'')) like $1 or lower(coalesce(v.address,'')) like $1)
      order by v.created_at asc
    `;
    return db.query(sql, [term]);
  },

  async findById(id) {
    return db.findById("venues", id);
  },

  async findProjectsByVenueId(venueId) {
    return db.query(
      `select * from projects where venue_id = $1 and published = true order by created_at desc`,
      [venueId]
    );
  },

  async insert(data) {
    return db.insert("venues", data);
  },

  async updateById(id, patch) {
    return db.updateById("venues", id, patch);
  },

  async unlinkProjects(venueId) {
    return db.query("UPDATE projects SET venue_id = NULL WHERE venue_id = $1", [venueId]);
  },

  async removeById(id) {
    return db.removeById("venues", id);
  },
};
