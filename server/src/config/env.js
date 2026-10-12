import "dotenv/config";
import { z } from "zod";

/**
 * Schema định nghĩa và ép kiểu toàn bộ biến môi trường của hệ thống.
 * Fail-closed: thiếu biến bắt buộc sẽ dừng server ngay lập tức để bảo vệ dữ liệu.
 */
const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),
    TRUST_PROXY: z
      .union([z.coerce.number(), z.string()])
      .optional(),
    JWT_SECRET: z
      .string({
        required_error: "JWT_SECRET là bắt buộc ở mọi môi trường.",
      })
      .min(32, "JWT_SECRET phải có độ dài tối thiểu 32 ký tự."),
    JWT_EXPIRES_IN: z.string().default("15m"),
    DATABASE_URL: z
      .string({
        required_error: "DATABASE_URL là bắt buộc ở mọi môi trường.",
      })
      .min(1, "DATABASE_URL không được để trống."),
    DB_POOL_MAX: z.coerce.number().int().positive().default(10),
    DB_SSL: z
      .preprocess((val) => {
        if (typeof val === "boolean") return val;
        if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
        return false;
      }, z.boolean())
      .default(false),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    ADMIN_EMAIL: z.string().optional(),
    ADMIN_PASSWORD: z.string().optional(),
  })
  .transform((data) => {
    // Mặc định trust proxy: 1 khi ở production (phía sau reverse proxy Render/Railway), 0 khi dev
    if (data.TRUST_PROXY === undefined) {
      data.TRUST_PROXY = data.NODE_ENV === "production" ? 1 : 0;
    }
    return data;
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
      if (!data.CLOUDINARY_CLOUD_NAME || !data.CLOUDINARY_CLOUD_NAME.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CLOUDINARY_CLOUD_NAME là bắt buộc ở production.",
          path: ["CLOUDINARY_CLOUD_NAME"],
        });
      }
      if (!data.CLOUDINARY_API_KEY || !data.CLOUDINARY_API_KEY.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CLOUDINARY_API_KEY là bắt buộc ở production.",
          path: ["CLOUDINARY_API_KEY"],
        });
      }
      if (!data.CLOUDINARY_API_SECRET || !data.CLOUDINARY_API_SECRET.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CLOUDINARY_API_SECRET là bắt buộc ở production.",
          path: ["CLOUDINARY_API_SECRET"],
        });
      }
    }
  });

/**
 * Validate môi trường với Zod, dừng tiến trình nếu cấu hình không hợp lệ.
 */
export function validateEnv(source = process.env) {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    console.error("================================================================");
    console.error("[FATAL STARTUP ERROR] Cấu hình biến môi trường không hợp lệ:");
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }

    const hasJwtError = result.error.issues.some((i) => i.path.includes("JWT_SECRET"));
    if (hasJwtError) {
      console.error("\nHướng dẫn tạo JWT_SECRET ngẫu nhiên an toàn (tối thiểu 32 ký tự):");
      console.error('  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    }
    console.error("================================================================");
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();
