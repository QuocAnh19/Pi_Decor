import dotenv from "dotenv";
import fs from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { generateDataDictionary, generateErd } from "./db-docs-formatter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, "..", ".env") });

function resolveConnectionOptions(customUrl) {
  const dbUrl =
    customUrl ||
    process.env.DATABASE_URL_DIRECT ||
    process.env.DATABASE_URL_TEST ||
    process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      "[gen-db-docs.js] Thiếu biến môi trường DATABASE_URL hoặc DATABASE_URL_DIRECT."
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

  if (ssl && process.env.DB_SSL_CA) {
    try {
      const trimmed = process.env.DB_SSL_CA.trim();
      ssl.ca = fs.existsSync(trimmed) ? fs.readFileSync(trimmed, "utf-8") : trimmed;
    } catch (err) {
      console.warn("[gen-db-docs.js] Không thể nạp DB_SSL_CA:", err.message);
    }
  }

  return { connectionString: dbUrl, ssl };
}

export async function fetchDbMetadata(pool) {
  const tablesQuery = `
    SELECT
      c.relname AS table_name,
      obj_description(c.oid, 'pg_class') AS table_comment
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname != 'schema_migrations'
    ORDER BY c.relname;
  `;

  const columnsQuery = `
    SELECT
      c.relname AS table_name,
      a.attname AS column_name,
      format_type(a.atttypid, a.atttypmod) AS data_type,
      NOT a.attnotnull AS is_nullable,
      pg_get_expr(d.adbin, d.adrelid) AS column_default,
      col_description(c.oid, a.attnum) AS column_comment
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND a.attnum > 0
      AND NOT a.attisdropped
      AND c.relname != 'schema_migrations'
    ORDER BY c.relname, a.attnum;
  `;

  const constraintsQuery = `
    SELECT
      con.conname AS constraint_name,
      con.contype AS constraint_type,
      c_src.relname AS table_name,
      pg_get_constraintdef(con.oid) AS definition,
      c_dest.relname AS foreign_table,
      case con.confdeltype
        when 'c' then 'CASCADE'
        when 'n' then 'SET NULL'
        when 'r' then 'RESTRICT'
        when 'd' then 'SET DEFAULT'
        else 'NO ACTION'
      end as on_delete_action
    FROM pg_constraint con
    JOIN pg_class c_src ON c_src.oid = con.conrelid
    JOIN pg_namespace n_src ON n_src.oid = c_src.relnamespace
    LEFT JOIN pg_class c_dest ON c_dest.oid = con.confrelid
    WHERE n_src.nspname = 'public'
      AND c_src.relname != 'schema_migrations'
      AND con.contype IN ('p', 'f')
    ORDER BY c_src.relname, con.conname;
  `;

  const indexesQuery = `
    SELECT
      tablename AS table_name,
      indexname AS index_name,
      indexdef AS index_def
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename != 'schema_migrations'
    ORDER BY tablename, indexname;
  `;

  const triggersQuery = `
    SELECT
      event_object_table AS table_name,
      trigger_name,
      event_manipulation,
      action_timing,
      action_statement
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
      AND event_object_table != 'schema_migrations'
    ORDER BY event_object_table, trigger_name;
  `;

  const [tRes, cRes, kRes, iRes, trgRes] = await Promise.all([
    pool.query(tablesQuery),
    pool.query(columnsQuery),
    pool.query(constraintsQuery),
    pool.query(indexesQuery),
    pool.query(triggersQuery),
  ]);

  return {
    tables: tRes.rows,
    columns: cRes.rows,
    constraints: kRes.rows,
    indexes: iRes.rows,
    triggers: trgRes.rows,
  };
}

export async function generateDatabaseDocumentation(customUrl) {
  const options = resolveConnectionOptions(customUrl);
  const pool = new pg.Pool(options);

  try {
    const metadata = await fetchDbMetadata(pool);
    const dataDictionaryMd = generateDataDictionary(metadata);
    const erdMd = generateErd(metadata);

    const outDir = path.resolve(__dirname, "..", "..", "..", "docs", "data");
    await mkdir(outDir, { recursive: true });

    await writeFile(path.join(outDir, "DATA_DICTIONARY.md"), dataDictionaryMd, "utf-8");
    await writeFile(path.join(outDir, "ERD.md"), erdMd, "utf-8");

    console.log(`[gen-db-docs.js] ✓ Đã sinh tài liệu thành công:`);
    console.log(`  - docs/data/DATA_DICTIONARY.md (${metadata.tables.length} bảng)`);
    console.log(`  - docs/data/ERD.md (sơ đồ Mermaid)`);
    return { metadata, dataDictionaryMd, erdMd };
  } finally {
    await pool.end();
  }
}

// Chạy trực tiếp qua CLI
const isDirectCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectCli) {
  let customUrl = null;
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--url=")) {
      customUrl = arg.split("=")[1];
    }
  }

  generateDatabaseDocumentation(customUrl)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[gen-db-docs.js] Lỗi thực thi:", err);
      process.exit(1);
    });
}
