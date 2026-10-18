import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateDatabaseDocumentation } from "../scripts/gen-db-docs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../..");

describe("Database Documentation Generator (gen-db-docs)", () => {
  it("trích xuất metadata và sinh tài liệu thành công trên cơ sở dữ liệu đã migrate", async () => {
    const result = await generateDatabaseDocumentation();

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

    // Kiểm tra tài liệu DATA_DICTIONARY.md
    const dictPath = path.join(rootDir, "docs", "data", "DATA_DICTIONARY.md");
    expect(fs.existsSync(dictPath)).toBe(true);
    const dictContent = fs.readFileSync(dictPath, "utf-8");
    expect(dictContent).toContain("# Từ Điển Dữ Liệu Pi Decor (Data Dictionary)");
    expect(dictContent).toContain("admins");
    expect(dictContent).toContain("quotations");

    // Kiểm tra tài liệu ERD.md
    const erdPath = path.join(rootDir, "docs", "data", "ERD.md");
    expect(fs.existsSync(erdPath)).toBe(true);
    const erdContent = fs.readFileSync(erdPath, "utf-8");
    expect(erdContent).toContain("# Sơ Đồ Thực Thể Quan Hệ Pi Decor (ERD)");
    expect(erdContent).toContain("erDiagram");
    expect(erdContent).toContain("Phân Hệ CRM Khách Hàng & Báo Giá");
  });

  it("sơ đồ Mermaid ERD có cú pháp trường an toàn không chứa ký tự cấm", async () => {
    const erdPath = path.join(rootDir, "docs", "data", "ERD.md");
    const erdContent = fs.readFileSync(erdPath, "utf-8");

    // Mermaid erDiagram cấm dấu ngoặc kép hoặc ký tự đặc biệt chưa sanitize trong kiểu dữ liệu
    expect(erdContent).not.toMatch(/timestamp with time zone/);
    expect(erdContent).not.toMatch(/text\[\]/);
    expect(erdContent).not.toMatch(/double precision/);
  });
});
