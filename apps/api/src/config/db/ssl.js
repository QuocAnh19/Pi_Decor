import fs from "fs";
import { env } from "../env.js";
import { logger } from "../logger.js";

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
