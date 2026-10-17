import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/auth.js";

const DUMMY_HASH = bcrypt.hashSync("dummy_password_timing_protection", 10);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export const authService = {
  async login({ email, password }) {
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPassword = typeof password === "string" ? password : "";

    if (!cleanEmail || !cleanPassword) {
      throw createHttpError(400, "Thiếu email hoặc mật khẩu.");
    }

    // Luôn hash/so sánh dummy hash nếu admin không tồn tại để chống timing attack
    const admin = await authRepository.findAdminByEmail(cleanEmail);
    const passwordHash = admin ? admin.password_hash : DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(cleanPassword, passwordHash);

    if (!admin || !isPasswordValid) {
      throw createHttpError(401, "Sai email hoặc mật khẩu.");
    }

    const role = admin.role ?? "admin";
    const token = jwt.sign({ sub: admin.id, email: admin.email, role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const rawRefreshToken = crypto.randomBytes(40).toString("hex");
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const familyId = crypto.randomUUID();

    await authRepository.insertRefreshToken({
      admin_id: admin.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      revoked_at: null,
      family_id: familyId,
      replaced_by: null,
    });

    return {
      token,
      refreshToken: rawRefreshToken,
      admin: { id: admin.id, email: admin.email, role },
    };
  },

  async refresh({ refresh_token }) {
    const tokenHash = hashToken(refresh_token);
    const match = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!match) {
      throw createHttpError(401, "Refresh token không hợp lệ hoặc đã hết hạn.");
    }

    if (match.revoked_at) {
      await authRepository.revokeAllRefreshTokensForAdmin(match.admin_id);
      throw createHttpError(
        401,
        "Phát hiện refresh token bị sử dụng lại. Mọi phiên đăng nhập đã bị thu hồi vì lý do an toàn."
      );
    }

    if (new Date(match.expires_at) <= new Date()) {
      throw createHttpError(401, "Refresh token không hợp lệ hoặc đã hết hạn.");
    }

    const admin = await authRepository.findAdminById(match.admin_id);
    if (!admin) {
      throw createHttpError(401, "Tài khoản admin không tồn tại.");
    }

    const newRawRefreshToken = crypto.randomBytes(40).toString("hex");
    const newTokenHash = hashToken(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const familyId = match.family_id || match.id;

    await authRepository.rotateRefreshToken(
      match.id,
      newTokenHash,
      newExpiresAt,
      familyId,
      admin.id
    );

    const role = admin.role ?? "admin";
    const token = jwt.sign({ sub: admin.id, email: admin.email, role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      refreshToken: newRawRefreshToken,
    };
  },

  async logout({ refresh_token }) {
    if (refresh_token && typeof refresh_token === "string") {
      const tokenHash = hashToken(refresh_token);
      await authRepository.revokeRefreshTokenByHash(tokenHash);
    }
    return { message: "Đã đăng xuất thành công." };
  },

  async logoutAll(adminId) {
    await authRepository.revokeAllRefreshTokensForAdmin(adminId);
    return { message: "Đã thu hồi tất cả phiên đăng nhập thành công." };
  },

  async getMe(adminId) {
    const admin = await authRepository.findAdminById(adminId);
    if (!admin) {
      throw createHttpError(401, "Tài khoản admin không tồn tại.");
    }
    return {
      admin: { id: admin.id, email: admin.email, role: admin.role ?? "admin" },
    };
  },

  async updateMe(adminId, { email, newPassword, password, currentPassword, current_password }) {
    const admin = await authRepository.findAdminById(adminId);
    if (!admin) {
      throw createHttpError(404, "Không tìm thấy tài khoản admin.");
    }

    const patch = {};
    const nextPassword = newPassword || password;
    const currentPass = currentPassword || current_password;

    const isEmailProvided = email !== undefined;
    const cleanEmail = isEmailProvided ? String(email).trim().toLowerCase() : "";
    const isEmailChanging = isEmailProvided && cleanEmail !== admin.email.toLowerCase();
    const isPasswordChanging = Boolean(nextPassword);

    if (isEmailChanging || isPasswordChanging) {
      if (!currentPass) {
        throw createHttpError(400, "Vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi.");
      }
      const isCurrentValid = await bcrypt.compare(currentPass, admin.password_hash);
      if (!isCurrentValid) {
        throw createHttpError(400, "Mật khẩu hiện tại không chính xác.");
      }
    }

    if (isEmailChanging) {
      if (!cleanEmail) {
        throw createHttpError(400, "Email không được để trống.");
      }
      if (!EMAIL_REGEX.test(cleanEmail)) {
        throw createHttpError(400, "Định dạng email không hợp lệ.");
      }
      const admins = await authRepository.findAllAdmins();
      const duplicate = admins.find(
        (a) => a.id !== admin.id && a.email && a.email.trim().toLowerCase() === cleanEmail
      );
      if (duplicate) {
        throw createHttpError(409, "Email này đã được sử dụng bởi tài khoản khác.");
      }
      patch.email = cleanEmail;
    }

    if (isPasswordChanging) {
      if (
        typeof nextPassword !== "string" ||
        nextPassword.length < 12 ||
        nextPassword.length > 128
      ) {
        throw createHttpError(400, "Mật khẩu mới phải từ 12 đến 128 ký tự.");
      }
      patch.password_hash = await bcrypt.hash(nextPassword, 10);
    }

    if (Object.keys(patch).length === 0) {
      return {
        message: "Không có thay đổi nào.",
        admin: { id: admin.id, email: admin.email, role: admin.role ?? "admin" },
      };
    }

    try {
      const updated = await authRepository.updateAdminById(admin.id, patch);
      const updatedAdmin = updated || { ...admin, ...patch };

      // Khi đổi mật khẩu thành công, thu hồi toàn bộ refresh token cũ của admin
      if (isPasswordChanging) {
        await authRepository.revokeAllRefreshTokensForAdmin(admin.id);
      }

      const role = updatedAdmin.role ?? admin.role ?? "admin";
      const newToken = jwt.sign(
        { sub: updatedAdmin.id, email: updatedAdmin.email, role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        message: "Cập nhật thông tin thành công.",
        token: newToken,
        admin: { id: updatedAdmin.id, email: updatedAdmin.email, role },
      };
    } catch (err) {
      if (err.code === "23505") {
        throw createHttpError(409, "Email này đã được sử dụng bởi tài khoản khác.");
      }
      throw err;
    }
  },

  async getAllAdmins() {
    const admins = await authRepository.findAllAdmins();
    return admins.map((a) => ({
      id: a.id,
      email: a.email,
      role: a.role ?? "admin",
      created_at: a.created_at ?? null,
    }));
  },

  async createAdmin({ email, password }) {
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPassword = typeof password === "string" ? password : "";

    if (!cleanEmail || !cleanPassword) {
      throw createHttpError(400, "Thiếu email hoặc mật khẩu.");
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      throw createHttpError(400, "Định dạng email không hợp lệ.");
    }
    if (cleanPassword.length < 12 || cleanPassword.length > 128) {
      throw createHttpError(400, "Mật khẩu phải từ 12 đến 128 ký tự.");
    }

    const existing = await authRepository.findAdminByEmail(cleanEmail);
    if (existing) {
      throw createHttpError(409, "Email này đã được sử dụng.");
    }

    const password_hash = await bcrypt.hash(cleanPassword, 10);
    try {
      const inserted = await authRepository.insertAdmin({
        email: cleanEmail,
        password_hash,
        role: "admin",
      });

      return {
        id: inserted.id,
        email: inserted.email,
        role: inserted.role,
        created_at: inserted.created_at,
      };
    } catch (err) {
      if (err.code === "23505") {
        throw createHttpError(409, "Email này đã được sử dụng.");
      }
      throw err;
    }
  },

  async deleteAdmin(id, currentAdminId) {
    if (id === currentAdminId) {
      throw createHttpError(400, "Không thể tự xoá tài khoản của chính mình.");
    }

    const target = await authRepository.findAdminById(id);
    if (!target) {
      throw createHttpError(404, "Không tìm thấy tài khoản admin.");
    }

    // Không cho phép xoá owner cuối cùng trong hệ thống
    if (target.role === "owner") {
      const allAdmins = await authRepository.findAllAdmins();
      const ownerCount = allAdmins.filter((a) => a.role === "owner").length;
      if (ownerCount <= 1) {
        throw createHttpError(400, "Không thể xoá tài khoản owner cuối cùng.");
      }
    }

    await authRepository.removeAdminById(id);
  },
};
