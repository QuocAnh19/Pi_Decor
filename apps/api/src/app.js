import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import { env } from "./config/env.js";
import { pool } from "./config/database.js";
import { httpLogger } from "./config/logger.js";
import { hasCloudinary } from "./utils/uploadImage.js";
import { leadsRouter } from "./modules/leads/leads.routes.js";
import { errorHandler } from "./shared/errorHandler.js";
import { materialsRouter } from "./modules/materials/materials.routes.js";
import { servicesRouter } from "./modules/services/services.routes.js";
import { venuesRouter } from "./modules/venues/venues.routes.js";
import { projectsRouter } from "./modules/projects/projects.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { adminRouter } from "./routes/admin/index.js";
import { quotationsRouter } from "./modules/quotations/quotations.routes.js";
import { testimonialsRouter } from "./modules/testimonials/testimonials.routes.js";
import { studioRouter } from "./modules/studio/studio.routes.js";

import { initSentry } from "./config/sentry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initSentry();

export const app = express();

// Thiết lập trust proxy để rate limiting và log IP chuẩn xác sau reverse proxy (Render, Railway, Nginx)
app.set("trust proxy", env.TRUST_PROXY);

// Ghi log request với pino-http kèm request ID và redact thông tin nhạy cảm
app.use(httpLogger);

// Security headers (X-Content-Type-Options, X-Frame-Options, gỡ bỏ X-Powered-By)
app.use(helmet());

const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin header (curl, mobile, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Chỉ cho phép localhost regex ở môi trường development/test
      if (
        env.NODE_ENV !== "production" &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      const corsErr = new Error("CORS policy violation");
      corsErr.status = 403;
      callback(corsErr);
    },
  })
);

// Đăng ký parser giới hạn riêng cho các endpoint nhận dữ liệu lớn trước parser toàn cục
app.post("/api/leads", express.json({ limit: "5mb" }));
app.put("/api/studio/templates/:id/publish", express.json({ limit: "10mb" }));

// Giới hạn parser toàn cục chống tấn công làm cạn kiệt bộ nhớ (DDoS/Memory Exhaustion)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "100kb", extended: true }));

// Chỉ phục vụ uploads tĩnh từ đĩa cục bộ khi không dùng Cloudinary
if (!hasCloudinary) {
  app.use(
    "/uploads",
    (_req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(path.join(__dirname, "..", "uploads"))
  );
}

// Liveness check: chỉ kiểm tra tiến trình Node.js sống, KHÔNG query DB để tránh đánh thức Neon compute
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness check: kiểm tra kết nối cơ sở dữ liệu với timeout 3s
app.get("/api/health/ready", async (_req, res) => {
  const start = Date.now();
  try {
    if (!pool) {
      return res.status(503).json({ status: "degraded", db: "unreachable" });
    }
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB ping timeout")), 3000)
    );
    await Promise.race([pool.query("SELECT 1"), timeoutPromise]);
    const latency_ms = Date.now() - start;
    res.json({
      status: "ok",
      db: "connected",
      latency_ms,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Không lộ chi tiết err.message để tránh rò rỉ thông tin hạ tầng
    res.status(503).json({ status: "degraded", db: "unreachable" });
  }
});

app.use("/api/leads", leadsRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/venues", venuesRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/quotations", quotationsRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/studio", studioRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Không tìm thấy route: ${req.method} ${req.path}` });
});

app.use(errorHandler);
