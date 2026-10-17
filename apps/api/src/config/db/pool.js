import pg from "pg";
import { env } from "../env.js";
import { logger } from "../logger.js";
import { resolveDbConnectionOptions } from "./ssl.js";

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

const mainDbOptions = resolveDbConnectionOptions(env.DATABASE_URL, env.DB_SSL, env.DB_SSL_CA);
export const pool = new pg.Pool({
  connectionString: mainDbOptions.connectionString,
  ssl: mainDbOptions.ssl,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  statement_timeout: 15_000,
});

pool.on("error", (err) => {
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
    const directDbOptions = resolveDbConnectionOptions(
      env.DATABASE_URL_DIRECT || env.DATABASE_URL,
      env.DB_SSL,
      env.DB_SSL_CA
    );
    _directPool = new pg.Pool({
      connectionString: directDbOptions.connectionString,
      ssl: directDbOptions.ssl,
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
