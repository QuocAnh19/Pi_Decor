/**
 * scripts/docs-db-fresh.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Tạo cơ sở dữ liệu tạm trên PostgreSQL cục bộ, chạy migration, sinh tài liệu
 * Data Dictionary và ERD chuẩn xác định (Prettier-clean), sau đó xóa DB tạm.
 * Đảm bảo tài liệu luôn phản ánh đúng 100% schema từ migration mới nhất.
 */

import { spawn, spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { runMigrations } from "../apps/api/database/migrate.js";
import { generateDatabaseDocumentation } from "../apps/api/scripts/gen-db-docs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function isLocalHost(host) {
  return ["localhost", "127.0.0.1", "postgres"].includes((host || "").toLowerCase());
}

function findPostgresBin(name) {
  // Kiểm tra PATH trước
  const isWin = process.platform === "win32";
  const exeName = isWin ? `${name}.exe` : name;
  const whereCmd = isWin ? "where" : "which";
  const res = spawnSync(whereCmd, [exeName], { encoding: "utf8" });
  if (res.status === 0 && res.stdout.trim()) {
    const firstPath = res.stdout.trim().split(/\r?\n/)[0];
    if (fs.existsSync(firstPath)) return firstPath;
  }

  // Kiểm tra đường dẫn cài đặt phổ biến trên Windows
  if (isWin) {
    const candidates = [
      `D:\\AppIT\\PostgresSQL\\bin\\${exeName}`,
      `C:\\Program Files\\PostgreSQL\\18\\bin\\${exeName}`,
      `C:\\Program Files\\PostgreSQL\\17\\bin\\${exeName}`,
      `C:\\Program Files\\PostgreSQL\\16\\bin\\${exeName}`,
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

async function testConnection(connStr) {
  const pool = new pg.Pool({ connectionString: connStr, connectionTimeoutMillis: 2000 });
  try {
    const res = await pool.query("SELECT 1 as ok");
    await pool.end();
    return res.rows.length > 0;
  } catch {
    await pool.end().catch(() => {});
    return false;
  }
}

async function resolveAdminConnection() {
  const candidates = [];
  if (process.env.LOCAL_PG_URL) candidates.push(process.env.LOCAL_PG_URL);

  const envDirect = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
  if (envDirect) {
    try {
      const u = new URL(envDirect);
      if (isLocalHost(u.hostname)) {
        u.pathname = "/postgres";
        u.searchParams.set("sslmode", "disable");
        candidates.push(u.toString());
      }
    } catch {}
  }

  candidates.push(
    "postgresql://pidecor:pidecor_dev_only@127.0.0.1:5432/postgres?sslmode=disable",
    "postgresql://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable",
    "postgresql://postgres:admin@127.0.0.1:5432/postgres?sslmode=disable",
    "postgresql://postgres@127.0.0.1:5432/postgres?sslmode=disable"
  );

  for (const url of candidates) {
    if (await testConnection(url)) {
      return { type: "existing", adminUrl: url };
    }
  }

  // Nếu không kết nối được PostgreSQL có sẵn, thử dựng cluster tạm bằng initdb
  const initdbBin = findPostgresBin("initdb");
  const postgresBin = findPostgresBin("postgres");
  const pgCtlBin = findPostgresBin("pg_ctl");

  if (initdbBin && postgresBin) {
    console.log("[docs:db:fresh] Khởi động PostgreSQL cluster tạm thời cho phiên tạo tài liệu...");
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pidecor_pg_cluster_"));
    const tempPort = 54329;

    // initdb với trust auth
    const initRes = spawnSync(initdbBin, ["-D", tempDir, "-U", "postgres", "-A", "trust", "--no-sync"], {
      encoding: "utf8",
    });
    if (initRes.status !== 0) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      throw new Error(`[docs:db:fresh] initdb thất bại: ${initRes.stderr || initRes.stdout}`);
    }

    // Chạy postgres server trong background process
    const pgProcess = spawn(
      postgresBin,
      ["-D", tempDir, "-p", String(tempPort), "-c", "listen_addresses=127.0.0.1"],
      { stdio: "ignore", detached: false }
    );

    const adminUrl = `postgresql://postgres@127.0.0.1:${tempPort}/postgres?sslmode=disable`;

    // Chờ server sẵn sàng
    let ready = false;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 400));
      if (await testConnection(adminUrl)) {
        ready = true;
        break;
      }
    }

    if (!ready) {
      try { pgProcess.kill(); } catch {}
      fs.rmSync(tempDir, { recursive: true, force: true });
      throw new Error("[docs:db:fresh] Không thể khởi động PostgreSQL cluster tạm thời.");
    }

    return {
      type: "ephemeral",
      adminUrl,
      cleanup: async () => {
        try {
          if (pgCtlBin) {
            spawnSync(pgCtlBin, ["stop", "-D", tempDir, "-m", "immediate"]);
          } else {
            pgProcess.kill();
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 600));
        fs.rmSync(tempDir, { recursive: true, force: true });
      },
    };
  }

  throw new Error(
    "[docs:db:fresh] Không tìm thấy PostgreSQL cục bộ nào khả dụng (Port 5432 hoặc initdb). Vui lòng khởi động Docker Compose hoặc PostgreSQL cục bộ."
  );
}

async function main() {
  console.log("==================================================================");
  console.log("       PI DECOR — TÁI SINH TÀI LIỆU CƠ SỞ DỮ LIỆU TỪ DB MỚI        ");
  console.log("==================================================================");

  const resolved = await resolveAdminConnection();
  const pool = new pg.Pool({ connectionString: resolved.adminUrl });
  const client = await pool.connect();
  const tempDbName = `pidecor_fresh_docs_${Date.now()}`;

  try {
    console.log(`[docs:db:fresh] 1. Khởi tạo cơ sở dữ liệu tạm thời: ${tempDbName}...`);
    await client.query(`DROP DATABASE IF EXISTS ${tempDbName} WITH (FORCE);`);
    await client.query(`CREATE DATABASE ${tempDbName};`);

    const tempUrlObj = new URL(resolved.adminUrl);
    tempUrlObj.pathname = `/${tempDbName}`;
    const tempDbUrl = tempUrlObj.toString();

    console.log("[docs:db:fresh] 2. Áp dụng toàn bộ migrations vào cơ sở dữ liệu tạm...");
    await runMigrations(tempDbUrl);

    console.log("[docs:db:fresh] 3. Trích xuất schema catalog và định dạng tài liệu bằng Prettier...");
    await generateDatabaseDocumentation(tempDbUrl);

    console.log(`[docs:db:fresh] 4. Thu dọn cơ sở dữ liệu tạm thời ${tempDbName}...`);
    await client.query(`DROP DATABASE IF EXISTS ${tempDbName} WITH (FORCE);`);
    console.log("✓ Hoàn tất tái sinh tài liệu cơ sở dữ liệu thành công!");
  } finally {
    client.release();
    await pool.end();
    if (resolved.cleanup) {
      await resolved.cleanup();
    }
  }
}

main().catch((err) => {
  console.error("✗ Lỗi tái sinh docs:", err.message || err);
  process.exit(1);
});
