import "dotenv/config";

/**
 * Validates mandatory environment variables before the server starts.
 * In production mode, missing critical variables will log clear errors and exit immediately.
 */
export function validateEnv() {
  const isProduction = process.env.NODE_ENV === "production";
  const missingVars = [];

  if (isProduction) {
    if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
      missingVars.push("JWT_SECRET");
    }
    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.trim()) {
      missingVars.push("DATABASE_URL");
    }
    if (!process.env.CORS_ORIGIN || !process.env.CORS_ORIGIN.trim()) {
      missingVars.push("CORS_ORIGIN");
    }
  }

  if (missingVars.length > 0) {
    console.error("================================================================");
    console.error("[FATAL STARTUP ERROR] Thiếu các biến môi trường bắt buộc cho Production:");
    missingVars.forEach((v) => console.error(`  - ${v}`));
    console.error("Server không thể khởi động vì lý do an toàn dữ liệu và bảo mật.");
    console.error("Vui lòng cấu hình đầy đủ các biến trên trong .env hoặc Dashboard hosting.");
    console.error("================================================================");
    process.exit(1);
  }
}
