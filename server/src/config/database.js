import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * config/database.js
 * ───────────────────
 * This is the ONLY file in the codebase every route imports `db` from —
 * routes call db.get()/db.insert()/db.update()/db.remove() and never touch
 * storage directly. That mirrors how Ecovera isolates its MySQL pool inside
 * Config/dataBase.js (Mục 2.1 of the technical proposal).
 *
 *   • DATABASE_URL is set  → delegates to config/database.pg.js (Postgres:
 *     Neon, Supabase, Render Postgres, or a local Docker container).
 *   • DATABASE_URL is unset → falls back to the original JSON file at
 *     src/data/db.json. Zero setup, good for a quick local clone with no
 *     Postgres running, NOT suitable for production (single instance only,
 *     and Render Free wipes the disk on every restart).
 *
 * Either way, every route file stays exactly as it was written — this is
 * the one-file swap the original comment in this file promised. Run
 * `npm run migrate` once against a fresh Postgres database before flipping
 * DATABASE_URL on (see database/README.md).
 */

let db;
let pool = null;

if (process.env.DATABASE_URL) {
  ({ db, pool } = await import("./database.pg.js"));
  console.log("[database.js] Using Postgres via DATABASE_URL.");
} else {
  db = createJsonFileDb();
  console.log(
    "[database.js] DATABASE_URL not set — using local JSON file at src/data/db.json. " +
      "Do not use this mode in production."
  );
}

export { db, pool };

// ── JSON-file implementation (unchanged from the original prototype) ──────

function createJsonFileDb() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const DB_PATH = path.join(__dirname, "..", "data", "db.json");

  const DEFAULT_DATA = {
    leads: [],
    designs: [],
    materials: [],
    services: [],
    admins: [],
    venues: [],
    projects: [],
  };

  async function ensureFile() {
    if (!existsSync(DB_PATH)) {
      await mkdir(path.dirname(DB_PATH), { recursive: true });
      await writeFile(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
    }
  }

  async function readAll() {
    await ensureFile();
    const raw = await readFile(DB_PATH, "utf-8");
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  }

  async function writeAll(data) {
    await writeFile(DB_PATH, JSON.stringify(data, null, 2));
  }

  // Simple mutex so two concurrent requests can't interleave a
  // read-modify-write and clobber each other's change (a real DB gives you
  // this for free; a flat JSON file does not).
  let queue = Promise.resolve();
  function locked(fn) {
    const result = queue.then(fn);
    queue = result.catch(() => {});
    return result;
  }

  return {
    get: (collection) => locked(async () => (await readAll())[collection] ?? []),

    set: (collection, rows) =>
      locked(async () => {
        const data = await readAll();
        data[collection] = rows;
        await writeAll(data);
        return rows;
      }),

    insert: (collection, row) =>
      locked(async () => {
        const data = await readAll();
        data[collection] = [...(data[collection] ?? []), row];
        await writeAll(data);
        return row;
      }),

    update: (collection, predicate, patch) =>
      locked(async () => {
        const data = await readAll();
        const rows = data[collection] ?? [];
        const idx = rows.findIndex(predicate);
        if (idx === -1) return null;
        rows[idx] = { ...rows[idx], ...patch };
        await writeAll(data);
        return rows[idx];
      }),

    remove: (collection, predicate) =>
      locked(async () => {
        const data = await readAll();
        const before = data[collection]?.length ?? 0;
        data[collection] = (data[collection] ?? []).filter((r) => !predicate(r));
        await writeAll(data);
        return before - data[collection].length;
      }),

    updateById: (collection, id, patch) =>
      locked(async () => {
        const data = await readAll();
        const rows = data[collection] ?? [];
        const idx = rows.findIndex((r) => String(r.id) === String(id));
        if (idx === -1) return null;
        rows[idx] = { ...rows[idx], ...patch };
        await writeAll(data);
        return rows[idx];
      }),

    removeById: (collection, id) =>
      locked(async () => {
        const data = await readAll();
        const before = data[collection]?.length ?? 0;
        data[collection] = (data[collection] ?? []).filter((r) => String(r.id) !== String(id));
        await writeAll(data);
        return before - (data[collection]?.length ?? 0);
      }),

    removeWhere: (collection, column, value) =>
      locked(async () => {
        const data = await readAll();
        const before = data[collection]?.length ?? 0;
        data[collection] = (data[collection] ?? []).filter((r) => String(r[column]) !== String(value));
        await writeAll(data);
        return before - (data[collection]?.length ?? 0);
      }),

    updateWhere: (collection, column, value, patch) =>
      locked(async () => {
        const data = await readAll();
        const rows = data[collection] ?? [];
        let updatedCount = 0;
        for (let i = 0; i < rows.length; i++) {
          if (String(rows[i][column]) === String(value)) {
            rows[i] = { ...rows[i], ...patch };
            updatedCount++;
          }
        }
        await writeAll(data);
        return updatedCount;
      }),

    query: async () => {
      throw new Error("[database.js] Raw SQL query() is not supported in JSON file mode. Use Postgres.");
    },

    count: (collection, whereClause = "1=1", values = []) =>
      locked(async () => {
        const data = await readAll();
        const rows = data[collection] ?? [];
        if (!whereClause || whereClause === "1=1") return rows.length;
        if (whereClause === "status = $1" && values?.[0]) {
          return rows.filter((r) => r.status === values[0]).length;
        }
        if (whereClause === "published = true") {
          return rows.filter((r) => r.published === true || r.published === 1).length;
        }
        return rows.length;
      }),
  };
}
