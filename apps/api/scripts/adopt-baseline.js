import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, "..", ".env") });

/**
 * Script đồng bộ cơ sở dữ liệu đã có sang 0001_baseline.sql.
 * Không thực thi lại các câu lệnh DDL để tránh xung đột dữ liệu hiện tại,
 * chỉ cập nhật lại bảng theo dõi schema_migrations sang baseline duy nhất.
 */

const REQUIRED_CORE_TABLES = [
  "admins",
  "leads",
  "projects",
  "quotations",
  "venues",
  "studio_templates",
];

async function adoptBaseline(customConnectionString) {
  const dbUrl =
    customConnectionString ||
    process.env.DATABASE_URL_DIRECT ||
    process.env.DATABASE_URL_TEST ||
    process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL_DIRECT hoặc DATABASE_URL chưa được thiết lập."
    );
  }

  console.log("\n========================================================");
  console.log("⚠️  CẢNH BÁO BẮT BUỘC SAO LƯU DỮ LIỆU");
  console.log("Script này sẽ xóa toàn bộ lịch sử migrations cũ trong bảng");
  console.log("schema_migrations và gán 0001_baseline.sql là migration duy nhất.");
  console.log("BẮT BUỘC tạo bản sao lưu (pg_dump hoặc Neon snapshot/branch)");
  console.log("trước khi áp dụng trên môi trường staging hoặc production.");
  console.log("========================================================\n");

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
      console.error("[adopt-baseline] Lỗi khi nạp DB_SSL_CA:", err.message);
    }
  }

  const pool = new pg.Pool({
    connectionString: normalizedDbUrl,
    ssl,
  });

  const client = await pool.connect();
  try {
    // 1. Kiểm tra các bảng chính xem DB đã có schema cũ hay chưa
    const { rows: existingTables } = await client.query(
      `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = ANY($1)
      `,
      [REQUIRED_CORE_TABLES]
    );

    const existingNames = new Set(existingTables.map((r) => r.table_name));
    const missing = REQUIRED_CORE_TABLES.filter((t) => !existingNames.has(t));

    if (missing.length > 0) {
      throw new Error(
        `Không thể adopt baseline: Thiếu các bảng chính: ${missing.join(", ")}. ` +
        `Cơ sở dữ liệu trống hoặc chưa hoàn thiện, hãy chạy 'npm run migrate' thay vì adopt.`
      );
    }

    // 2. Đảm bảo bảng schema_migrations tồn tại
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename    text primary key,
        applied_at  timestamptz not null default now()
      );
    `);

    // 3. Thực thi chuyển đổi trong 1 TRANSACTION nguyên tử
    await client.query("BEGIN");
    try {
      await client.query("DELETE FROM schema_migrations;");
      await client.query(
        "INSERT INTO schema_migrations (filename, applied_at) VALUES ($1, NOW());",
        ["0001_baseline.sql"]
      );
      await client.query("COMMIT");
      console.log("✓ Đã adopt 0001_baseline.sql thành công vào schema_migrations.");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith("adopt-baseline.js")) {
  adoptBaseline(process.argv[2])
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("✗ Lỗi adopt baseline:", err.message);
      process.exit(1);
    });
}

export { adoptBaseline };
