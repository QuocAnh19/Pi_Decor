import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../src/config/database.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../src/config/auth.js";

export const TEST_ADMIN = {
  id: "a0000000-0000-4000-8000-000000000001",
  email: "admin.test@pidecor.vn",
  password: "AdminPassword123!",
  role: "admin",
};

/**
 * Tạo admin test trong database nếu chưa tồn tại
 */
export async function seedTestAdmin() {
  const passwordHash = await bcrypt.hash(TEST_ADMIN.password, 10);
  await pool.query(
    `insert into admins (id, email, password_hash, role)
     values ($1, $2, $3, $4)
     on conflict (id) do update set
       email = excluded.email,
       password_hash = excluded.password_hash,
       role = excluded.role`,
    [TEST_ADMIN.id, TEST_ADMIN.email, passwordHash, TEST_ADMIN.role]
  );
}

/**
 * Sinh token admin hợp lệ để dùng trong các test yêu cầu xác thực
 */
export function generateTestAdminToken(admin = TEST_ADMIN) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}
