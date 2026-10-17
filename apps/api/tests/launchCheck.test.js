import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

describe("Launch Readiness Script (launch:check)", () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  // apps/api/tests: tests -> api -> apps -> Project (3 cấp)
  const rootDir = resolve(__dirname, "../../..");
  const scriptPath = resolve(rootDir, "scripts/check-launch-readiness.mjs");

  it("chạy thành công với cờ --soft ngay cả khi thiếu biến môi trường production", () => {
    // Chạy ở chế độ --soft phải trả về exit code 0
    const output = execSync(`node "${scriptPath}" --soft`, {
      encoding: "utf-8",
      cwd: rootDir,
      env: {
        ...process.env,
        // Giả lập môi trường thiếu biến production
        VITE_BUSINESS_TELEPHONE: "",
        VITE_PRIVACY_POLICY_REVIEWED: "false",
      },
    });

    expect(output).toContain("SOFT (Warning Only)");
    expect(output).toContain("CẢNH BÁO TIỀN TRIỂN KHAI (--soft)");
  });

  it("thất bại với exit code 1 ở chế độ --strict khi thiếu các biến bắt buộc", () => {
    let errorCaught = null;
    try {
      execSync(`node "${scriptPath}" --strict`, {
        encoding: "utf-8",
        cwd: rootDir,
        env: {
          ...process.env,
          VITE_BUSINESS_NAME: "",
          VITE_BUSINESS_TELEPHONE: "",
          VITE_PRIVACY_POLICY_REVIEWED: "false",
        },
      });
    } catch (err) {
      errorCaught = err;
    }

    expect(errorCaught).not.toBeNull();
    expect(errorCaught.status).toBe(1);
    const combinedOutput = String(errorCaught.stdout || "") + String(errorCaught.stderr || "");
    expect(combinedOutput).toContain("LAUNCH GATE THẤT BẠI");
  });
});
