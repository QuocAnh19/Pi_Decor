import { db } from "../../config/database.js";

export const authRepository = {
  async findAllAdmins() {
    return db.get("admins");
  },

  async findAdminByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();
    const admins = await db.get("admins");
    return admins.find((a) => a.email && a.email.trim().toLowerCase() === cleanEmail) || null;
  },

  async findAdminById(id) {
    return db.findById("admins", id);
  },

  async insertAdmin(adminData) {
    return db.insert("admins", adminData);
  },

  async updateAdminById(id, patch) {
    return db.updateById("admins", id, patch);
  },

  async removeAdminById(id) {
    return db.removeById("admins", id);
  },

  async insertRefreshToken(data) {
    return db.insert("refresh_tokens", data);
  },

  async findRefreshTokenByHash(tokenHash) {
    return db.findOneBy("refresh_tokens", "token_hash", tokenHash);
  },

  async revokeAllRefreshTokensForAdmin(adminId) {
    return db.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE admin_id = $1 AND revoked_at IS NULL",
      [adminId]
    );
  },

  async revokeRefreshTokenByHash(tokenHash) {
    return db.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL",
      [tokenHash]
    );
  },

  async rotateRefreshToken(oldTokenId, newTokenHash, newExpiresAt, familyId, adminId) {
    await db.query("UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by = $1 WHERE id = $2", [
      newTokenHash,
      oldTokenId,
    ]);

    return db.insert("refresh_tokens", {
      admin_id: adminId,
      token_hash: newTokenHash,
      expires_at: newExpiresAt,
      revoked_at: null,
      family_id: familyId,
      replaced_by: null,
    });
  },
};
