import "dotenv/config";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

/**
 * database/migrate.js
 * ─────────────────────
 * Applies every .sql file in database/migrations/, in filename order,
 * exactly once per database — tracked in the `schema_migrations` table
 * created by 0002_schema_migrations.sql.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node database/migrate.js
 *   # or, once wired into package.json:
 *   npm run migrate
 *
 * Safe to run on every deploy: already-applied files are skipped.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "✗ DATABASE_URL is not set. Add it to server/.env (see .env.example) before running migrations."
    );
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost")
      ? false
      : { rejectUnauthorized: false }, // required by Neon / Supabase pooled connections
  });

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort(); // "0001_..." < "0002_..." lexicographically — keep the zero-padding

  // 0002_schema_migrations.sql creates the tracking table itself, so it must
  // always run first and can't check itself. Every other file is applied
  // only if not already recorded.
  const client = await pool.connect();
  try {
    for (const file of files) {
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf-8");

      if (file !== "0002_schema_migrations.sql") {
        const { rows } = await client.query(
          "select 1 from schema_migrations where filename = $1",
          [file]
        ).catch(() => ({ rows: [] })); // table may not exist yet on a brand-new DB
        if (rows.length > 0) {
          console.log(`· skip  ${file} (already applied)`);
          continue;
        }
      }

      console.log(`→ apply ${file}`);
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query(
          "insert into schema_migrations (filename) values ($1) on conflict do nothing",
          [file]
        );
        await client.query("commit");
      } catch (err) {
        await client.query("rollback");
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }
    console.log("✓ All migrations applied.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("✗ Migration run failed:", err.message);
  process.exit(1);
});
