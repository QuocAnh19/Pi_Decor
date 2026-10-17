import "dotenv/config";
import fs from "fs";
import pg from "pg";

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

  const isLocalHost = ["localhost", "127.0.0.1", "postgres"].some((h) =>
    dbUrl.includes(h)
  );
  let ssl = false;
  const sslMode = process.env.DB_SSL;
  if (sslMode === "disable") {
    ssl = false;
  } else if (sslMode === "require") {
    ssl = { rejectUnauthorized: false };
  } else if (sslMode === "verify-full" || (!sslMode && !isLocalHost)) {
    ssl = { rejectUnauthorized: true };
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
    connectionString: dbUrl,
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
