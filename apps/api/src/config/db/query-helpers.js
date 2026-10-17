import { pool, runWithRetry } from "./pool.js";
import { TABLES, assertKnownTable, quoteCol, serializeValue } from "./allowlist.js";

export async function getAll(table) {
  assertKnownTable(table);
  const hasCreatedAt = TABLES[table].includes("created_at");
  const orderBy = hasCreatedAt ? " order by created_at asc" : "";
  const { rows } = await runWithRetry(() => pool.query(`select * from ${table}${orderBy}`));
  return rows;
}

export async function insertRow(runner, table, row) {
  assertKnownTable(table);
  const cols = TABLES[table].filter((c) => row[c] !== undefined);
  const values = cols.map((c) => serializeValue(c, row[c]));
  const placeholders = cols.map((_, i) => `$${i + 1}`);

  const { rows } = await runner.query(
    `insert into ${table} (${cols.map(quoteCol).join(", ")})
     values (${placeholders.join(", ")})
     returning *`,
    values
  );
  return rows[0];
}

export const db = {
  /** Read an entire table, e.g. db.get('leads'). Oldest first */
  get: (table) => getAll(table),

  /** Overwrite an entire table with a new array of rows. */
  set: async (table, rows) => {
    assertKnownTable(table);
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(`delete from ${table}`);
      for (const row of rows) {
        await insertRow(client, table, row);
      }
      await client.query("commit");
      return rows;
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }
  },

  /** Append one row to a table and return the row as stored. */
  insert: (table, row) => insertRow(pool, table, row),

  /** Update the first row matching `predicate`. */
  update: async (table, predicate, patch) => {
    assertKnownTable(table);
    const rows = await getAll(table);
    const match = rows.find(predicate);
    if (!match) return null;

    const cols = TABLES[table].filter((c) => c in patch && c !== "id" && c !== "created_at");
    if (cols.length === 0) return match;

    const values = cols.map((c) => serializeValue(c, patch[c]));
    const setClauses = cols.map((c, i) => `${quoteCol(c)} = $${i + 1}`);

    const { rows: updated } = await pool.query(
      `update ${table} set ${setClauses.join(", ")}
       where id = $${cols.length + 1}
       returning *`,
      [...values, match.id]
    );
    return updated[0];
  },

  /** Delete every row matching `predicate`. Returns the number removed. */
  remove: async (table, predicate) => {
    assertKnownTable(table);
    const rows = await getAll(table);
    const toRemove = rows.filter(predicate);
    if (toRemove.length === 0) return 0;

    await pool.query(`delete from ${table} where id = any($1::uuid[])`, [
      toRemove.map((r) => r.id),
    ]);
    return toRemove.length;
  },

  /**
   * Cập nhật row theo ID — không cần fetch toàn bộ bảng.
   */
  updateById: async (table, id, patch) => {
    assertKnownTable(table);
    const cols = TABLES[table].filter((c) => c in patch && c !== "id" && c !== "created_at");
    if (cols.length === 0) {
      const { rows } = await pool.query(`select * from ${table} where id = $1`, [id]);
      return rows[0] ?? null;
    }

    const values = cols.map((c) => serializeValue(c, patch[c]));
    const setClauses = cols.map((c, i) => `${quoteCol(c)} = $${i + 1}`);

    const { rows } = await pool.query(
      `update ${table}
       set ${setClauses.join(", ")}
       where id = $${cols.length + 1}
       returning *`,
      [...values, id]
    );
    return rows[0] ?? null;
  },

  /**
   * Xóa row theo ID — không cần fetch toàn bộ bảng.
   */
  removeById: async (table, id) => {
    assertKnownTable(table);
    const { rowCount } = await pool.query(`delete from ${table} where id = $1`, [id]);
    return rowCount;
  },

  /**
   * Xóa nhiều rows theo một cột cụ thể — dùng cho foreign key.
   */
  removeWhere: async (table, column, value) => {
    assertKnownTable(table);
    const { rowCount } = await pool.query(`delete from ${table} where ${quoteCol(column)} = $1`, [
      value,
    ]);
    return rowCount;
  },

  /**
   * Cập nhật rows theo một cột cụ thể — không cần fetch toàn bộ bảng.
   */
  updateWhere: async (table, column, value, patch) => {
    assertKnownTable(table);
    const cols = TABLES[table].filter((c) => c in patch && c !== "id" && c !== "created_at");
    if (cols.length === 0) return [];

    const values = cols.map((c) => serializeValue(c, patch[c]));
    const setClauses = cols.map((c, i) => `${quoteCol(c)} = $${i + 1}`);

    const { rows } = await pool.query(
      `update ${table}
       set ${setClauses.join(", ")}
       where ${quoteCol(column)} = $${cols.length + 1}
       returning *`,
      [...values, value]
    );
    return rows;
  },

  /**
   * Chạy SQL tùy ý.
   */
  query: async (sql, values = []) => {
    const isSelect = typeof sql === "string" && sql.trim().toUpperCase().startsWith("SELECT");
    if (isSelect) {
      const { rows } = await runWithRetry(() => pool.query(sql, values));
      return rows;
    }
    const { rows } = await pool.query(sql, values);
    return rows;
  },

  /**
   * Đếm rows theo điều kiện.
   */
  count: async (table, whereClause = "1=1", values = []) => {
    assertKnownTable(table);
    const { rows } = await runWithRetry(() =>
      pool.query(`select count(*)::int as n from ${table} where ${whereClause}`, values)
    );
    return rows[0].n;
  },

  /**
   * Tìm 1 bản ghi theo ID.
   */
  findById: async (table, id) => {
    assertKnownTable(table);
    const { rows } = await runWithRetry(() =>
      pool.query(`select * from ${table} where id = $1 limit 1`, [id])
    );
    return rows[0] ?? null;
  },

  /**
   * Tìm 1 bản ghi theo một cột và giá trị cụ thể.
   */
  findOneBy: async (table, column, value) => {
    assertKnownTable(table);
    const allowedCols = TABLES[table];
    if (!allowedCols.includes(column)) {
      throw new Error(`[database.pg.js] Cột không hợp lệ: "${column}" cho bảng "${table}".`);
    }
    const { rows } = await runWithRetry(() =>
      pool.query(`select * from ${table} where ${column} = $1 limit 1`, [value])
    );
    return rows[0] ?? null;
  },
};
