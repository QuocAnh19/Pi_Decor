import dotenv from "dotenv";
import fs from "fs";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, "..", ".env") });

/**
 * database/migrate.js
 * ─────────────────────
 * Applies every .sql file in database/migrations/, in filename order,
 * exactly once per database — tracked in the `schema_migrations` table
 * created by 0002_schema_migrations.sql.
 *
 * Usage:
 *   DATABASE_URL_DIRECT=postgresql://... node database/migrate.js
 *   # or, once wired into package.json:
 *   npm run migrate
 *
 * Safe to run on every deploy: already-applied files are skipped.
 */

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function client_bootstrap(pool) {
  await pool.query(`
    create table if not exists schema_migrations (
      filename    text primary key,
      applied_at  timestamptz not null default now()
    );
  `);
}

export async function runMigrations(customConnectionString) {
  const dbUrl =
    customConnectionString ||
    process.env.DATABASE_URL_DIRECT ||
    process.env.DATABASE_URL_TEST ||
    process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL hoặc DATABASE_URL_DIRECT chưa được thiết lập."
    );
  }

  let host = "";
  try {
    const parsed = new URL(dbUrl);
    host = parsed.hostname;
  } catch {
    const match = dbUrl.match(/@([^:/]+)/);
    host = match ? match[1] : "";
  }
  const isLocalHost = ["localhost", "127.0.0.1", "postgres"].includes(
    (host || "").toLowerCase()
  );
  const effectiveSslMode =
    process.env.DB_SSL || (isLocalHost ? "disable" : "verify-full");
  let ssl = false;
  if (effectiveSslMode === "require") {
    ssl = { rejectUnauthorized: false };
  } else if (effectiveSslMode === "verify-full") {
    ssl = { rejectUnauthorized: true };
  }

  let normalizedDbUrl = dbUrl;
  try {
    const parsedUrl = new URL(dbUrl);
    if (effectiveSslMode === "disable") {
      parsedUrl.searchParams.set("sslmode", "disable");
      parsedUrl.searchParams.delete("uselibpqcompat");
    } else if (effectiveSslMode === "require") {
      parsedUrl.searchParams.set("sslmode", "require");
      parsedUrl.searchParams.set("uselibpqcompat", "true");
    } else if (effectiveSslMode === "verify-full") {
      parsedUrl.searchParams.set("sslmode", "verify-full");
      parsedUrl.searchParams.delete("uselibpqcompat");
    }
    normalizedDbUrl = parsedUrl.toString();
  } catch {
    normalizedDbUrl = dbUrl;
  }

  if (ssl && process.env.DB_SSL_CA) {
    try {
      const trimmed = process.env.DB_SSL_CA.trim();
      if (fs.existsSync(trimmed)) {
        ssl.ca = fs.readFileSync(trimmed, "utf-8");
      } else {
        ssl.ca = trimmed;
      }
    } catch (err) {
      console.error("[migrate.js] Lỗi khi nạp DB_SSL_CA:", err.message);
    }
  }

  const pool = new pg.Pool({
    connectionString: normalizedDbUrl,
    ssl,
  });

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  await client_bootstrap(pool);

  const client = await pool.connect();
  try {
    for (const file of files) {
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf-8");

      const { rows } = await client.query(
        "select 1 from schema_migrations where filename = $1",
        [file],
      );
      if (rows.length > 0) {
        continue;
      }

      await client.query("begin");
      try {
        await client.query(sql);
        await client.query(
          "insert into schema_migrations (filename) values ($1) on conflict do nothing",
          [file],
        );
        await client.query("commit");
      } catch (err) {
        await client.query("rollback");
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

// Chạy trực tiếp qua `npm run migrate`
if (process.argv[1] && process.argv[1].endsWith("migrate.js")) {
  runMigrations()
    .then(() => console.log("✓ All migrations applied."))
    .catch((err) => {
      console.error("✗ Migration run failed:", err.message);
      process.exit(1);
    });
}
