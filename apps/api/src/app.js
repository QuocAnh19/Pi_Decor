import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import { env } from "./config/env.js";
import { pool } from "./config/database.js";
import { httpLogger } from "./config/logger.js";
import { hasCloudinary } from "./utils/uploadImage.js";
import { loginLimiter } from "./middlewares/rateLimiters.js";
import { leadsRouter } from "./modules/leads/leads.routes.js";
import { errorHandler } from "./shared/errorHandler.js";
import { materialsRouter } from "./routes/materials/index.js";
import { servicesRouter } from "./routes/services/index.js";
import { venuesRouter } from "./routes/venues/index.js";
import { projectsRouter } from "./modules/projects/projects.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { adminRouter } from "./routes/admin/index.js";
import { quotationsRouter } from "./modules/quotations/quotations.routes.js";
import { testimonialsRouter } from "./routes/testimonials/index.js";
import { studioRouter } from "./routes/studio/index.js";

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

app.get("/api/health", async (_req, res) => {
  try {
    if (pool) {
      await pool.query("SELECT 1");
    }
    res.json({ status: "ok", db: "connected", ts: new Date().toISOString() });
  } catch {
    // Không lộ chi tiết err.message để tránh rò rỉ thông tin hạ tầng
    res.status(503).json({ status: "degraded", db: "unreachable" });
  }
});

app.use("/api/auth/login", loginLimiter);

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
