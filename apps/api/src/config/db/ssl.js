import fs from "fs";
import { env } from "../env.js";
import { logger } from "../logger.js";

function applyCa(sslConfig, caInput) {
  try {
    const trimmed = (caInput || "").trim();
    if (!trimmed) return;
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
 * Xác định hostname từ connection string URL.
 */
export function extractHost(targetUrl = "") {
  try {
    const url = new URL(targetUrl);
    return url.hostname || "";
  } catch {
    const match = (targetUrl || "").match(/@([^:/]+)/);
    return match ? match[1] : "";
  }
}

/**
 * Xác định chế độ SSL thực tế (disable | require | verify-full).
 */
export function resolveEffectiveSslMode(targetUrl = "", explicitMode = env?.DB_SSL) {
  if (explicitMode) {
    return explicitMode;
  }
  const host = extractHost(targetUrl).toLowerCase();
  const isLocalHost = ["localhost", "127.0.0.1", "postgres"].includes(host);
  return isLocalHost ? "disable" : "verify-full";
}

/**
 * Phân tích cấu hình SSL an toàn dựa trên env.DB_SSL và host cơ sở dữ liệu.
 * Mặc định: tắt SSL nếu host là localhost/127.0.0.1/postgres (docker dev),
 * ngược lại bật verify-full (rejectUnauthorized: true) để chống tấn công MITM.
 */
export function resolveSslConfig(
  targetUrl = env?.DATABASE_URL,
  explicitMode = env?.DB_SSL,
  caInput = env?.DB_SSL_CA
) {
  const sslMode = resolveEffectiveSslMode(targetUrl, explicitMode);

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
    if (caInput) {
      applyCa(sslConfig, caInput);
    }
    return sslConfig;
  }

  // Chế độ verify-full (rejectUnauthorized: true) — an toàn chống tấn công MITM
  const sslConfig = { rejectUnauthorized: true };
  if (caInput) {
    applyCa(sslConfig, caInput);
  }
  return sslConfig;
}

/**
 * Chuẩn hóa URL connection string cho tương thích pg v9 & pg-connection-string v3:
 * - Khi mode='verify-full': đảm bảo tham số sslmode=verify-full tường minh
 * - Khi mode='require': bật tùy chọn libpq-compat uselibpqcompat=true&sslmode=require
 * - Khi mode='disable': đảm bảo sslmode=disable
 */
export function normalizeConnectionString(
  targetUrl = env?.DATABASE_URL,
  explicitMode = env?.DB_SSL
) {
  if (!targetUrl || typeof targetUrl !== "string") {
    return targetUrl;
  }

  try {
    const url = new URL(targetUrl);
    const mode = resolveEffectiveSslMode(targetUrl, explicitMode);

    if (mode === "disable") {
      url.searchParams.set("sslmode", "disable");
      url.searchParams.delete("uselibpqcompat");
    } else if (mode === "require") {
      url.searchParams.set("sslmode", "require");
      url.searchParams.set("uselibpqcompat", "true");
    } else if (mode === "verify-full") {
      url.searchParams.set("sslmode", "verify-full");
      url.searchParams.delete("uselibpqcompat");
    }

    return url.toString();
  } catch {
    return targetUrl;
  }
}

/**
 * Trả về tập hợp tùy chọn kết nối PostgreSQL chuẩn hóa cho pg.Pool.
 */
export function resolveDbConnectionOptions(
  targetUrl = env?.DATABASE_URL,
  explicitMode = env?.DB_SSL,
  caInput = env?.DB_SSL_CA
) {
  return {
    connectionString: normalizeConnectionString(targetUrl, explicitMode),
    ssl: resolveSslConfig(targetUrl, explicitMode, caInput),
  };
}
