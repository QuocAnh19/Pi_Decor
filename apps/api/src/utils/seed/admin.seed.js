import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db } from "../../config/database.js";
import { env } from "../../config/env.js";

export async function seedAdmins() {
  const email = env.ADMIN_EMAIL?.trim();
  const password = env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 12) {
    console.error(
      "[seed] Bắt buộc cung cấp ADMIN_EMAIL hợp lệ và ADMIN_PASSWORD có độ dài tối thiểu 12 ký tự."
    );
    process.exit(1);
  }

  const isResetPassword = process.argv.includes("--reset-password");

  const admins = await db.get("admins");
  const existingAdmin = admins.find((a) => a.email === email);

  if (!existingAdmin) {
    const password_hash = await bcrypt.hash(password, 10);
    await db.insert("admins", { id: randomUUID(), email, password_hash, role: "owner" });
    console.log(`✓ Admin account created with owner role: ${email}`);
  } else if (isResetPassword) {
    const password_hash = await bcrypt.hash(password, 10);
    await db.update("admins", (a) => a.email === email, { password_hash });
    console.log(`✓ Admin account password updated (--reset-password): ${email}`);
  } else {
    console.log(
      `ℹ Admin account ${email} đã tồn tại. Bỏ qua ghi đè mật khẩu (sử dụng --reset-password nếu muốn cập nhật).`
    );
  }
}
