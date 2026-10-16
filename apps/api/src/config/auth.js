import { env } from "./env.js";

// Khóa bí mật và thời hạn JWT lấy từ cấu hình env đã validate (không fallback mặc định không an toàn)
export const JWT_SECRET = env.JWT_SECRET;
export const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
