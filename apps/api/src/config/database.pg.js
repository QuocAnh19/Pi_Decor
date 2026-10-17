import fs from "fs";
import pg from "pg";
import { env } from "./env.js";
import { logger } from "./logger.js";

/**
 * Phân tích cấu hình SSL an toàn dựa trên env.DB_SSL và host cơ sở dữ liệu.
 * Mặc định: tắt SSL nếu host là localhost/127.0.0.1/postgres (docker dev),
 * ngược lại bật verify-full (rejectUnauthorized: true) để chống tấn công MITM.
 */
export function resolveSslConfig(targetUrl = env.DATABASE_URL) {
  let host = "";
  try {
    const url = new URL(targetUrl);
    host = url.hostname;
  } catch {
    const match = (targetUrl || "").match(/@([^:/]+)/);
    host = match ? match[1] : "";
  }

  const isLocalHost = ["localhost", "127.0.0.1", "postgres"].includes(host.toLowerCase());

  let sslMode = env.DB_SSL;
  if (!sslMode) {
    sslMode = isLocalHost ? "disable" : "verify-full";
  }

  if (sslMode === "disable") {
    return false;
  }

  if (sslMode === "require") {
    logger.warn(
      "[database.pg.js] CẢNH BÁO: Đang sử dụng DB_SSL='require' (rejectUnauthorized: false). " +
        "Kết nối được mã hóa nhưng không xác thực chứng chỉ máy chủ (nguy cơ MITM). " +
        "Khuyến nghị chuyển sang 'verify-full' trên môi trường production."
    );
    const sslConfig = { rejectUnauthorized: false };
    if (env.DB_SSL_CA) {
      applyCa(sslConfig, env.DB_SSL_CA);
    }
    return sslConfig;
  }

  // Chế độ verify-full (rejectUnauthorized: true) — an toàn chống tấn công MITM
  const sslConfig = { rejectUnauthorized: true };
  if (env.DB_SSL_CA) {
    applyCa(sslConfig, env.DB_SSL_CA);
  }
  return sslConfig;
}

function applyCa(sslConfig, caInput) {
  try {
    const trimmed = caInput.trim();
    if (fs.existsSync(trimmed)) {
      sslConfig.ca = fs.readFileSync(trimmed, "utf-8");
    } else {
      sslConfig.ca = trimmed;
    }
  } catch (err) {
    logger.error({ err: err.message }, "[database.pg.js] Lỗi khi nạp DB_SSL_CA");
  }
}

/**
 * Kiểm tra xem lỗi có phải do mất kết nối hoặc DB compute đang thức dậy hay không.
 */
export function isConnectionError(err) {
  if (!err) return false;
  const msg = (err.message || "").toLowerCase();
  const code = err.code;
  return (
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "EPIPE" ||
    code === "ETIMEDOUT" ||
    code === "57P01" || // admin_shutdown
    code === "57P02" || // crash_shutdown
    code === "57P03" || // cannot_connect_now
    code === "08006" || // connection_failure
    code === "08001" || // sqlclient_unable_to_establish_sqlconnection
    code === "08004" || // sqlserver_rejected_establishment_of_sqlconnection
    msg.includes("connection terminated") ||
    msg.includes("connection closed") ||
    msg.includes("client has encountered a connection error") ||
    msg.includes("terminating connection")
  );
}

/**
 * Thử lại 1 lần cho truy vấn đọc đơn giản nếu gặp sự cố mất kết nối mạng.
 * Tuyệt đối không bọc câu lệnh ghi (non-idempotent) vào hàm này.
 */
export async function runWithRetry(fn) {
  try {
    return await fn();
  } catch (err) {
    if (isConnectionError(err)) {
      logger.warn(
        { err: err.message },
        "[database.pg.js] Phát hiện ngắt kết nối khi đọc dữ liệu, tự động thử lại lần 2..."
      );
      return await fn();
    }
    throw err;
  }
}

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: resolveSslConfig(env.DATABASE_URL),

  // ── Security / resilience limits (see database/SECURITY.md §3) ────────
  // Cap how many connections this one server instance can open — Neon/
  // Supabase free tiers cap total concurrent connections per project, so a
  // runaway pool here would starve migrations/other tools of connections.
  max: env.DB_POOL_MAX,
  // Close connections that have sat idle for a while instead of holding
  // them open forever.
  idleTimeoutMillis: 30_000,
  // Give up (throw) if a connection can't be established quickly, rather
  // than hanging a request indefinitely.
  connectionTimeoutMillis: 10_000,
  // Kill any single query that runs longer than this — a slow/runaway
  // query (bad input, accidental full scan) can no longer tie up the pool
  // and starve every other request.
  statement_timeout: 15_000,
});

pool.on("error", (err) => {
  // Fired for errors on idle clients in the pool (e.g. the DB restarting
  // under a serverless/auto-suspend plan like Neon's). Log, don't crash —
  // the pool reconnects the next query.
  logger.error({ err: err.message }, "[pg pool] unexpected error on idle client");
});

/**
 * Thử kết nối lúc khởi động (startup retry) tối đa 3 lần, giãn cách 2s.
 */
export async function testDbConnection(targetPool = pool, maxRetries = 3, delayMs = 2000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      const client = await targetPool.connect();
      try {
        await client.query("SELECT 1");
      } finally {
        client.release();
      }
      logger.info(`[database] Kết nối PostgreSQL thành công (lần thử ${attempt}/${maxRetries}).`);
      return true;
    } catch (err) {
      logger.warn(
        { err: err.message, attempt, maxRetries },
        `[database] Kết nối PostgreSQL lần ${attempt}/${maxRetries} thất bại. Đang đợi Neon compute thức dậy...`
      );
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        logger.fatal(
          { err: err.message },
          "[database] Không thể kết nối cơ sở dữ liệu sau 3 lần thử. Dừng ứng dụng."
        );
        throw err;
      }
    }
  }
}

let _directPool = null;
export function getDirectPool() {
  if (!_directPool) {
    _directPool = new pg.Pool({
      connectionString: env.DATABASE_URL_DIRECT || env.DATABASE_URL,
      ssl: resolveSslConfig(env.DATABASE_URL_DIRECT || env.DATABASE_URL),
      max: env.DB_POOL_MAX,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      statement_timeout: 15_000,
    });
    _directPool.on("error", (err) => {
      logger.error({ err: err.message }, "[direct pg pool] unexpected error on idle client");
    });
  }
  return _directPool;
}

export const directPool = new Proxy(
  {},
  {
    get(_target, prop) {
      const p = getDirectPool();
      const val = p[prop];
      if (typeof val === "function") {
        return val.bind(p);
      }
      return val;
    },
  }
);

// ── Column allowlist per table ──────────────────────────────────────────
// Every INSERT/UPDATE is built exclusively from these lists, so a request
// body can never inject an arbitrary column name — only values are
// parameterized ($1, $2, ...), and only known column names are ever
// concatenated into SQL text. Keep this in sync with database/migrations/.
const TABLES = {
  admins: ["id", "email", "password_hash", "role", "created_at"],
  leads: [
    "id",
    "name",
    "phone",
    "email",
    "wedding_date",
    "message",
    "design_snapshot",
    "status",
    "created_at",
  ],
  materials: ["id", "name", "category", "color_hex", "image_url", "created_at", "updated_at"],
  services: [
    "id",
    "brand",
    "title",
    "tagline",
    "description",
    "icon",
    "accent",
    "items",
    "href",
    "cta_label",
    "featured",
    "cover",
    "order",
    "image_url",
    "created_at",
    "updated_at",
  ],
  venues: [
    "id",
    "name",
    "type",
    "address",
    "city",
    "lat",
    "lng",
    "cover_image",
    "created_at",
    "updated_at",
  ],
  projects: [
    "id",
    "venue_id",
    "title",
    "wedding_date",
    "style_tags",
    "cover_image",
    "gallery",
    "lead_id",
    "published",
    "created_at",
    "updated_at",
    "location",
    "description",
    "budget",
    "status",
    "category_id",
    "tag",
    "price_tier",
  ],
  lead_activities: ["id", "lead_id", "admin_id", "activity_type", "body", "metadata", "created_at"],
  quotations: [
    "id",
    "lead_id",
    "admin_id",
    "quotation_number",
    "items",
    "subtotal",
    "discount",
    "total",
    "status",
    "valid_until",
    "notes",
    "created_at",
    "updated_at",
  ],
  testimonials: [
    "id",
    "lead_id",
    "author",
    "role",
    "quote",
    "rating",
    "photos",
    "status",
    "source",
    "created_at",
    "updated_at",
  ],
  studio_templates: [
    "id",
    "name",
    "thumbnail",
    "svg_base",
    "category",
    "is_active",
    "default_config",
    "created_at",
    "updated_at",
  ],
  studio_slot_definitions: [
    "id",
    "template_id",
    "slot_key",
    "label",
    "slot_type",
    "norm_x",
    "norm_y",
    "norm_width",
    "norm_height",
    "allow_scale",
    "allow_rotate",
    "mirror_x",
    "z_index",
    "sort_order",
    "required",
  ],
  studio_assets: [
    "id",
    "asset_type",
    "name",
    "thumbnail",
    "svg_data",
    "color_hex",
    "font_family",
    "tags",
    "is_active",
    "dominant_colors",
    "created_at",
    "updated_at",
  ],
  studio_slot_rules: [
    "id",
    "template_id",
    "rule_name",
    "condition_slot",
    "condition_value",
    "target_slot",
    "action",
    "action_value",
    "priority",
  ],
  refresh_tokens: [
    "id",
    "admin_id",
    "token_hash",
    "expires_at",
    "revoked_at",
    "created_at",
    "family_id",
    "replaced_by",
  ],
  quotation_counters: ["year", "last_seq"],
};

// jsonb columns need JSON.stringify() before going over the wire; pg does
// NOT do this automatically for plain JS objects/arrays bound as query
// params (it only auto-parses jsonb coming *back* from the database).
const JSONB_COLUMNS = new Set([
  "design_snapshot",
  "gallery",
  "metadata",
  "items",
  "photos",
  "tags",
  "dominant_colors",
  "condition_value",
  "action_value",
  "default_config",
]);

function assertKnownTable(table) {
  if (!TABLES[table]) {
    throw new Error(`[database.pg.js] Unknown table "${table}" — add it to TABLES first.`);
  }
}

/** "order" is a reserved word; every other column name is safe unquoted. */
function quoteCol(col) {
  return col === "order" ? `"order"` : col;
}

function serializeValue(col, value) {
  if (value === undefined) return null;
  if (JSONB_COLUMNS.has(col) && value !== null) return JSON.stringify(value);
  return value;
}

async function getAll(table) {
  assertKnownTable(table);
  const hasCreatedAt = TABLES[table].includes("created_at");
  const orderBy = hasCreatedAt ? " order by created_at asc" : "";
  const { rows } = await runWithRetry(() => pool.query(`select * from ${table}${orderBy}`));
  return rows;
}

async function insertRow(runner, table, row) {
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
  /** Read an entire table, e.g. db.get('leads'). Oldest first (routes that
   *  need newest-first, e.g. GET /api/leads, already re-sort in JS). */
  get: (table) => getAll(table),

  /** Overwrite an entire table with a new array of rows. Used by
   *  utils/seed.js the first time a table is empty. Runs as a transaction
   *  so a failed row never leaves the table half-truncated. */
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

  /**
   * Update the first row matching `predicate` (a plain JS function run
   * against already-fetched rows, exactly as route files already write
   * it — e.g. `(l) => l.id === req.params.id`). Only columns present in
   * `patch` are written; `id` and `created_at` are never overwritten even
   * if present in patch.
   */
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
   * Dùng cho tất cả route có req.params.id.
   * Returns: row sau khi update, hoặc null nếu không tìm thấy.
   */
  updateById: async (table, id, patch) => {
    assertKnownTable(table);
    const cols = TABLES[table].filter((c) => c in patch && c !== "id" && c !== "created_at");
    if (cols.length === 0) {
      // không có gì để update — fetch row hiện tại trả về
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
   * Returns: số row đã xóa (0 hoặc 1).
   */
  removeById: async (table, id) => {
    assertKnownTable(table);
    const { rowCount } = await pool.query(`delete from ${table} where id = $1`, [id]);
    return rowCount;
  },

  /**
   * Xóa nhiều rows theo một cột cụ thể — dùng cho foreign key.
   * Ví dụ: xóa tất cả slot_definitions của một template.
   * db.removeWhere("studio_slot_definitions", "template_id", templateId)
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
   * Ví dụ: revoke token theo token_hash.
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
   * Chạy SQL tùy ý — dùng cho các trường hợp cần WHERE + LIMIT + OFFSET
   * mà interface get/update không đủ linh hoạt.
   * values: mảng giá trị cho $1, $2, ... trong sql string.
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
   * Đếm rows theo điều kiện — dùng cho summary counts.
   * Ví dụ: db.count("leads", "status = $1", ["new"])
   */
  count: async (table, whereClause = "1=1", values = []) => {
    assertKnownTable(table);
    const { rows } = await runWithRetry(() =>
      pool.query(`select count(*)::int as n from ${table} where ${whereClause}`, values)
    );
    return rows[0].n;
  },

  /**
   * Tìm 1 bản ghi theo ID (trả về row hoặc null).
   */
  findById: async (table, id) => {
    assertKnownTable(table);
    const { rows } = await runWithRetry(() =>
      pool.query(`select * from ${table} where id = $1 limit 1`, [id])
    );
    return rows[0] ?? null;
  },

  /**
   * Tìm 1 bản ghi theo một cột và giá trị cụ thể (trả về row hoặc null).
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

export { pool };
