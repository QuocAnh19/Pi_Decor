/**
 * db-docs-formatter.js
 * Định dạng dữ liệu PostgreSQL thành tài liệu Data Dictionary và sơ đồ Mermaid ERD.
 */

function sanitizeMermaidType(rawType) {
  if (!rawType) return "text";
  return rawType
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/\[\]/g, "_array")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9_]/g, "");
}

const DOMAIN_GROUPS = {
  crm: ["leads", "lead_activities", "quotations", "quotation_counters", "testimonials"],
  content: ["projects", "venues", "services", "materials"],
  studio: ["studio_templates", "studio_slot_definitions", "studio_assets", "studio_slot_rules"],
  auth: ["admins", "refresh_tokens"],
};

export function generateDataDictionary({ tables, columns, constraints, indexes, triggers }) {
  const lines = [
    "# Từ Điển Dữ Liệu Pi Decor (Data Dictionary)",
    "",
    "> Tài liệu này được sinh tự động bởi script `npm run docs:db` từ PostgreSQL catalog.",
    "",
    "## Danh Sách Các Bảng",
    "",
  ];

  for (let i = 0; i < tables.length; i++) {
    const t = tables[i];
    lines.push(`${i + 1}. [${t.table_name}](#${i + 1}-${t.table_name}) — ${t.table_comment || "Chưa có mô tả"}`);
  }
  lines.push("", "---", "");

  for (let i = 0; i < tables.length; i++) {
    const t = tables[i];
    const tableName = t.table_name;
    const tableCols = columns.filter((c) => c.table_name === tableName);
    const tableConstraints = constraints.filter((c) => c.table_name === tableName);
    const tableIndexes = indexes.filter((idx) => idx.table_name === tableName);
    const tableTriggers = triggers.filter((trg) => trg.table_name === tableName);

    lines.push(`### ${i + 1}. ${tableName}`);
    lines.push("");
    lines.push(`- **Mục đích**: ${t.table_comment || "Chưa có mô tả [CẦN XÁC NHẬN]"}`);

    const pk = tableConstraints.find((c) => c.constraint_type === "p");
    lines.push(`- **Khóa chính**: \`${pk ? pk.definition : "Không có"}\``);
    lines.push("");

    lines.push("#### Danh sách cột");
    lines.push("");
    lines.push("| Cột | Kiểu dữ liệu | Cho phép Null | Mặc định | Mô tả |");
    lines.push("| :--- | :--- | :--- | :--- | :--- |");

    for (const col of tableCols) {
      const nullableStr = col.is_nullable ? "Có" : "Không";
      const defaultStr = col.column_default ? `\`${col.column_default}\`` : "—";
      const commentStr = col.column_comment || "—";
      lines.push(`| \`${col.column_name}\` | \`${col.data_type}\` | ${nullableStr} | ${defaultStr} | ${commentStr} |`);
    }
    lines.push("");

    const fks = tableConstraints.filter((c) => c.constraint_type === "f");
    lines.push("#### Khóa ngoại (Foreign Keys)");
    if (fks.length === 0) {
      lines.push("- Không có khóa ngoại.");
    } else {
      for (const fk of fks) {
        lines.push(`- \`${fk.constraint_name}\`: \`${fk.definition}\``);
      }
    }
    lines.push("");

    lines.push("#### Chỉ mục (Indexes)");
    if (tableIndexes.length === 0) {
      lines.push("- Không có chỉ mục riêng.");
    } else {
      for (const idx of tableIndexes) {
        lines.push(`- \`${idx.index_name}\`: \`${idx.index_def}\``);
      }
    }
    lines.push("");

    lines.push("#### Triggers");
    if (tableTriggers.length === 0) {
      lines.push("- Không có trigger.");
    } else {
      for (const trg of tableTriggers) {
        lines.push(`- \`${trg.trigger_name}\`: ${trg.action_timing} ${trg.event_manipulation} — \`${trg.action_statement}\``);
      }
    }
    lines.push("", "---", "");
  }

  return lines.join("\n") + "\n";
}

export function generateErd({ tables, columns, constraints }) {
  const lines = [
    "# Sơ Đồ Thực Thể Quan Hệ Pi Decor (ERD)",
    "",
    "> Sơ đồ được sinh tự động từ các ràng buộc khóa ngoại (Foreign Keys) trong cơ sở dữ liệu PostgreSQL.",
    "",
    "## 1. Sơ Đồ Tổng Thể Hệ Thống",
    "",
    "```mermaid",
    "erDiagram",
  ];

  const fks = constraints.filter((c) => c.constraint_type === "f" && c.foreign_table);
  for (const fk of fks) {
    const parent = fk.foreign_table;
    const child = fk.table_name;
    const actionLabel = fk.on_delete_action || "CASCADE";
    lines.push(`    ${parent} ||--o{ ${child} : "FK (${actionLabel})"`);
  }

  lines.push("```", "", "---", "");

  const groupTitles = {
    crm: "2. Phân Hệ CRM Khách Hàng & Báo Giá",
    content: "3. Phân Hệ Quản Lý Nội Dung & Dự Án",
    studio: "4. Phân Hệ Studio Thiết Kế Không Gian",
    auth: "5. Phân Hệ Xác Thực & Quản Trị Viên",
  };

  for (const [groupKey, groupTables] of Object.entries(DOMAIN_GROUPS)) {
    lines.push(`## ${groupTitles[groupKey]}`, "", "```mermaid", "erDiagram");

    for (const tName of groupTables) {
      const tableObj = tables.find((t) => t.table_name === tName);
      if (!tableObj) continue;
      const tCols = columns.filter((c) => c.table_name === tName);
      const tConstraints = constraints.filter((c) => c.table_name === tName);

      lines.push(`    ${tName} {`);
      for (const col of tCols) {
        const safeType = sanitizeMermaidType(col.data_type);
        const isPk = tConstraints.some((c) => c.constraint_type === "p" && c.definition.includes(`(${col.column_name})`));
        const isFk = tConstraints.some((c) => c.constraint_type === "f" && c.definition.includes(`(${col.column_name})`));
        let flag = "";
        if (isPk) flag = " PK";
        else if (isFk) flag = " FK";
        lines.push(`        ${safeType} ${col.column_name}${flag}`);
      }
      lines.push("    }");
    }

    const groupFks = fks.filter((fk) => groupTables.includes(fk.table_name) && groupTables.includes(fk.foreign_table));
    for (const fk of groupFks) {
      const actionLabel = fk.on_delete_action || "CASCADE";
      lines.push(`    ${fk.foreign_table} ||--o{ ${fk.table_name} : "FK (${actionLabel})"`);
    }

    lines.push("```", "", "---", "");
  }

  // Loại bỏ dòng phân cách thừa ở cuối file nếu có
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines.join("\n") + "\n";
}
