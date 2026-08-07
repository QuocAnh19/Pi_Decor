import pg from "pg";

/**
 * config/database.pg.js
 * ───────────────────────
 * Postgres implementation of the exact same db.get/set/insert/update/remove
 * interface that config/database.js originally shipped with (JSON file on
 * disk). Every route file imports `db` from config/database.js and never
 * touches this file or a SQL string directly — see database/README.md for
 * why the SQL itself also lives in its own folder instead of inside route
 * files or components.
 *
 * Connects to any standard Postgres connection string: Neon, Supabase
 * (direct or pooled connection), Render Postgres, or a local `postgres`
 * Docker container for dev. Uses `pg`'s built-in connection pool — same
 * role as Ecovera's mysql2 promise pool (Mục 2.1 of the technical
 * proposal), just for Postgres instead of MySQL.
 *
 * IMPORTANT: run `npm run migrate` (database/migrate.js) against
 * DATABASE_URL at least once before starting the server with this file
 * active — it only ever reads/writes rows, it never creates tables.
 */

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon and Supabase both terminate TLS with a certificate that Node's
  // default trust store can't always chain to. rejectUnauthorized: false
  // keeps the connection encrypted while skipping that chain check — the
  // same trade-off Ecovera's README documents for its own hosted MySQL.
  // Skip it for a local `postgres` container (no TLS at all).
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },

  // ── Security / resilience limits (see database/SECURITY.md §3) ────────
  // Cap how many connections this one server instance can open — Neon/
  // Supabase free tiers cap total concurrent connections per project, so a
  // runaway pool here would starve migrations/other tools of connections.
  max: Number(process.env.DB_POOL_MAX ?? 10),
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
  console.error("[pg pool] unexpected error on idle client:", err.message);
});

// ── Column allowlist per table ──────────────────────────────────────────
// Every INSERT/UPDATE is built exclusively from these lists, so a request
// body can never inject an arbitrary column name — only values are
// parameterized ($1, $2, ...), and only known column names are ever
// concatenated into SQL text. Keep this in sync with database/migrations/.
const TABLES = {
  admins: ["id", "email", "password_hash", "created_at"],
  leads: [
    "id", "name", "phone", "email", "wedding_date", "message",
    "design_snapshot", "status", "created_at",
  ],
  designs: ["id", "lead_id", "layers", "thumbnail_url", "created_at"],
  materials: [
    "id", "name", "category", "color_hex", "image_url",
    "created_at", "updated_at",
  ],
  services: [
    "id", "title", "description", "image_url", "order",
    "created_at", "updated_at",
  ],
  venues: [
    "id", "name", "type", "address", "city", "lat", "lng", "cover_image",
    "created_at", "updated_at",
  ],
  projects: [
    "id", "venue_id", "title", "wedding_date", "style_tags", "cover_image",
    "gallery", "lead_id", "published", "created_at", "updated_at",
  ],
};

// jsonb columns need JSON.stringify() before going over the wire; pg does
// NOT do this automatically for plain JS objects/arrays bound as query
// params (it only auto-parses jsonb coming *back* from the database).
const JSONB_COLUMNS = new Set(["design_snapshot", "layers", "gallery"]);

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
  const { rows } = await pool.query(`select * from ${table} order by created_at asc`);
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

    const cols = TABLES[table].filter(
      (c) => c in patch && c !== "id" && c !== "created_at"
    );
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
};
