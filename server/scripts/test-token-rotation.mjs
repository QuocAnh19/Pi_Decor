import bcrypt from "bcryptjs";
import { db, pool } from "../src/config/database.js";

const BASE_URL = "http://localhost:4000/api";

async function runTests() {
  console.log("=== BẮT ĐẦU KIỂM THỬ TOKEN ROTATION & REUSE DETECTION (P10) ===");

  const testEmail = `test-rotation-${Date.now()}@pidecor.vn`;
  const testPassword = "ValidPassword123!";
  const hash = await bcrypt.hash(testPassword, 10);

  // 1. Tạo admin tạm thời
  const adminRes = await pool.query(
    "INSERT INTO admins (email, password_hash, role) VALUES ($1, $2, 'admin') RETURNING id, email",
    [testEmail, hash]
  );
  const testAdminId = adminRes.rows[0].id;
  console.log(`✓ [Setup] Đã tạo test admin: ${testEmail} (ID: ${testAdminId})`);

  try {
    // 2. Đăng nhập lần đầu
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    if (!loginRes.ok) throw new Error(`Login failed with status ${loginRes.status}`);
    const loginData = await loginRes.json();
    const token1 = loginData.token;
    const rt1 = loginData.refreshToken;

    if (!token1 || !rt1) throw new Error("Login không trả về token hoặc refreshToken");
    console.log("✓ [1] Đăng nhập thành công, nhận token1 và rt1.");

    // 3. Refresh lần 1 với rt1 -> phải thành công và xoay vòng ra rt2
    const refresh1Res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt1 }),
    });
    if (!refresh1Res.ok) throw new Error(`Refresh lần 1 thất bại với status ${refresh1Res.status}`);
    const refresh1Data = await refresh1Res.json();
    const token2 = refresh1Data.token;
    const rt2 = refresh1Data.refreshToken;

    if (!token2 || !rt2) throw new Error("Refresh lần 1 không trả về token mới hoặc rt2");
    if (rt2 === rt1) throw new Error("Refresh token KHÔNG được xoay vòng (rt2 trùng rt1)");
    console.log("✓ [2] Refresh lần 1 thành công: rt1 đã được xoay vòng thành rt2 mới.");

    // 4. Dùng LẠI rt1 (rt1 đã bị thu hồi) -> Phát hiện Reuse!
    const reuseRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt1 }),
    });
    if (reuseRes.status !== 401) {
      throw new Error(`Kỳ vọng 401 khi dùng lại rt1 cũ, nhưng nhận ${reuseRes.status}`);
    }
    const reuseData = await reuseRes.json();
    console.log(`✓ [3] Dùng lại rt1 cũ bị từ chối 401: "${reuseData.message}"`);

    // 5. Kiểm tra rt2 cũng ĐÃ BỊ THU HỒI do phát hiện tái sử dụng
    const checkRt2Res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt2 }),
    });
    if (checkRt2Res.status !== 401) {
      throw new Error(`Kỳ vọng rt2 bị thu hồi (401), nhưng nhận ${checkRt2Res.status}`);
    }
    console.log("✓ [4] rt2 mới cũng đã bị tự động thu hồi vì phát hiện tái sử dụng rt1 cũ!");

    // 6. Đăng nhập lại tạo phiên mới
    const login2Res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const login2Data = await login2Res.json();
    const token3 = login2Data.token;
    const rt3 = login2Data.refreshToken;
    console.log("✓ [5] Đăng nhập lại thành công, nhận token3 và rt3.");

    // 7. Gọi /auth/logout-all để thu hồi toàn bộ token
    const logoutAllRes = await fetch(`${BASE_URL}/auth/logout-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token3}`,
      },
    });
    if (!logoutAllRes.ok) throw new Error(`Logout-all thất bại với status ${logoutAllRes.status}`);
    const logoutAllData = await logoutAllRes.json();
    console.log(`✓ [6] Gọi /auth/logout-all thành công: "${logoutAllData.message}"`);

    // 8. Thử dùng rt3 sau logout-all -> phải bị 401
    const checkRt3Res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt3 }),
    });
    if (checkRt3Res.status !== 401) {
      throw new Error(`Kỳ vọng rt3 bị 401 sau logout-all, nhưng nhận ${checkRt3Res.status}`);
    }
    console.log("✓ [7] rt3 bị từ chối 401 sau khi gọi /auth/logout-all.");

    console.log("\n=== TẤT CẢ KIỂM THỬ TOKEN ROTATION & REUSE DETECTION ĐÃ PASS 100%! ===");
  } finally {
    // Dọn dẹp dữ liệu test
    await pool.query("DELETE FROM admins WHERE id = $1", [testAdminId]);
    await pool.end();
  }
}

runTests().catch((err) => {
  console.error("LỖI KIỂM THỬ:", err);
  process.exit(1);
});
