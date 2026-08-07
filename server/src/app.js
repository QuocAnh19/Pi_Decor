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

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── Rate limiting (database/SECURITY.md §5) ────────────────────────────────
// Applied per-IP. Two separate limiters because the two endpoints have very
// different legitimate traffic shapes: login is rare and sensitive (brute
// force target); the public lead form is public-facing and the main spam
// vector on this API.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau ít phút." },
});

const leadsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau." },
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/leads", leadsLimiter);

// Routes are organized by business domain, not by CRUD verb — same
// structure as Server/routes in the Ecovera reference project (Mục 2.4 /
// 3.4 of the technical proposal), so each domain can evolve independently.
app.use("/api/leads", leadsRouter);
app.use("/api/designs", designsRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/venues", venuesRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Không tìm thấy route: ${req.method} ${req.path}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ message: err.message ?? "Lỗi máy chủ." });
});
