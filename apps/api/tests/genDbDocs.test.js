import { describe, it, expect } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { generateDatabaseDocumentation } from "../scripts/gen-db-docs.js";

describe("Database Documentation Generator (gen-db-docs)", () => {
  it("từ chối chạy trên host từ xa khi không có cờ allowRemote", async () => {
    const remoteUrl = "postgresql://user:pass@ep-remote.neon.tech:5432/neondb";
    await expect(generateDatabaseDocumentation(remoteUrl, { allowRemote: false })).rejects.toThrow(
      "không phải cục bộ"
    );
  });

  it("trích xuất metadata và sinh tài liệu thành công trên cơ sở dữ liệu đã migrate", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pidecor_test_docs_"));
    try {
      const result = await generateDatabaseDocumentation(null, { allowRemote: true, outDir: tempDir });

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();

      const tableNames = result.metadata.tables.map((t) => t.table_name);
      // Kiểm tra các bảng cốt lõi của hệ thống
      expect(tableNames).toContain("admins");
      expect(tableNames).toContain("leads");
      expect(tableNames).toContain("quotations");
      expect(tableNames).toContain("projects");
      expect(tableNames).toContain("venues");
      expect(tableNames).toContain("materials");
      expect(tableNames).toContain("services");
      expect(tableNames).toContain("studio_templates");

      // Kiểm tra tài liệu DATA_DICTIONARY.md sinh trong thư mục tạm
      const dictPath = path.join(tempDir, "DATA_DICTIONARY.md");
      expect(fs.existsSync(dictPath)).toBe(true);
      const dictContent = fs.readFileSync(dictPath, "utf-8");
      expect(dictContent).toContain("# Từ Điển Dữ Liệu Pi Decor (Data Dictionary)");
      expect(dictContent).toContain("admins");
      expect(dictContent).toContain("quotations");

      // Kiểm tra tài liệu ERD.md sinh trong thư mục tạm
      const erdPath = path.join(tempDir, "ERD.md");
      expect(fs.existsSync(erdPath)).toBe(true);
      const erdContent = fs.readFileSync(erdPath, "utf-8");
      expect(erdContent).toContain("# Sơ Đồ Thực Thể Quan Hệ Pi Decor (ERD)");
      expect(erdContent).toContain("erDiagram");
      expect(erdContent).toContain("Phân Hệ CRM Khách Hàng & Báo Giá");

      // Kiểm tra cú pháp Mermaid erDiagram
      expect(erdContent).not.toMatch(/timestamp with time zone/);
      expect(erdContent).not.toMatch(/text\[\]/);
      expect(erdContent).not.toMatch(/double precision/);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

