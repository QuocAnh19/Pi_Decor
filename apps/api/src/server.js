import "dotenv/config";
import { validateEnv, env } from "./config/env.js";

// Validate mandatory environment variables before importing app
validateEnv();

const { logger } = await import("./config/logger.js");
const { app } = await import("./app.js");
const { pool } = await import("./config/database.js");

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`Pi Decor API listening on http://localhost:${PORT}`);
});

// Graceful shutdown — đóng kết nối DB sạch trước khi process exit
// Render/Railway gửi SIGTERM khi restart container
async function shutdown(signal) {
  logger.info(`[server] ${signal} nhận được — đang tắt server...`);
  server.close(async () => {
    try {
      if (pool) {
        await pool.end();
        logger.info("[server] Đã đóng kết nối Postgres pool.");
      }
    } catch (err) {
      logger.error({ err }, "[server] Lỗi khi đóng database pool");
    }
    logger.info("[server] Đã đóng server. Bye!");
    process.exit(0);
  });

  // Force kill sau 10s nếu server không đóng được
  setTimeout(() => {
    logger.error("[server] Tắt quá thời gian, force exit.");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
