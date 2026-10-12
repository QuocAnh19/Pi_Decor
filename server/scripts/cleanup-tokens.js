import { db, pool } from "../src/config/database.js";

/**
 * Script dọn dẹp các refresh token đã hết hạn hoặc đã thu hồi quá 7 ngày.
 * Thích hợp để chạy định kỳ qua Cron job hoặc worker.
 */
async function cleanupTokens() {
  try {
    const result = await pool.query(`
      DELETE FROM refresh_tokens
      WHERE expires_at < NOW() - INTERVAL '7 days'
         OR (revoked_at IS NOT NULL AND revoked_at < NOW() - INTERVAL '7 days')
    `);
    const count = result.rowCount ?? 0;
    console.log(`[cleanup-tokens] Đã dọn dẹp thành công ${count} refresh token hết hạn (> 7 ngày).`);
  } catch (err) {
    console.error("[cleanup-tokens] Lỗi khi dọn dẹp refresh token:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

cleanupTokens();
