import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import { leadsRouter } from "./routes/leads/index.js";
import { designsRouter } from "./routes/designs/index.js";
import { materialsRouter } from "./routes/materials/index.js";
import { servicesRouter } from "./routes/services/index.js";
import { venuesRouter } from "./routes/venues/index.js";
import { authRouter } from "./routes/auth/index.js";
import { adminRouter } from "./routes/admin/index.js";
import { quotationsRouter } from "./routes/quotations/index.js";
import { testimonialsRouter } from "./routes/testimonials/index.js";
import { studioRouter } from "./routes/studio/index.js";
import { pool } from "./config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

// Security headers (X-Content-Type-Options, X-Frame-Options, remove
// X-Powered-By, etc). See database/SECURITY.md §6 — default config is
// enough for a JSON-only API with no server-rendered HTML.
app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(",");
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
  })
);

app.use(express.json());

// Local-disk uploads served statically. See utils/uploadImage.js for why
// this must become Cloudinary (or similar) before deploying to Render Free.
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", async (_req, res) => {
  try {
    if (pool) {
      await pool.query("SELECT 1");
    }
    res.json({ status: "ok", db: pool ? "connected" : "json_fallback", ts: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: "degraded", db: "unreachable", error: err.message });
  }
});

import { loginLimiter } from "./middlewares/rateLimiters.js";

app.use("/api/auth/login", loginLimiter);

// Routes are organized by business domain, not by CRUD verb — same
// structure as Server/routes in the Ecovera reference project (Mục 2.4 /
// 3.4 of the technical proposal), so each domain can evolve independently.
import { projectsRouter } from "./routes/projects/index.js";

app.use("/api/leads", leadsRouter);
app.use("/api/designs", designsRouter);
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

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err && err.code === "LIMIT_FIELD_VALUE") {
    return res.status(400).json({ message: "Kích thước trường dữ liệu quá lớn." });
  }
  const statusCode = err.http_code || err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  res.status(statusCode).json({ message: err.message ?? "Lỗi máy chủ." });
});
