import { env } from "./env.js";

// Bắt buộc cấu hình PostgreSQL vì hệ thống đã loại bỏ chế độ JSON fallback
if (!env.DATABASE_URL) {
  throw new Error(
    "[database.js] Thiếu biến môi trường DATABASE_URL. Vui lòng thiết lập DATABASE_URL hoặc khởi động container Postgres qua lệnh: docker compose -f server/docker-compose.yml up -d"
  );
}

const { db, pool } = await import("./database.pg.js");

export { db, pool };
