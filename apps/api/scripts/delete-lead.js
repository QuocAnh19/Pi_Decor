import { directPool } from "../src/config/database.js";
import { logSecurityEvent } from "../src/shared/securityLogger.js";

function parseArgs() {
  const args = process.argv.slice(2);
  let email = null;
  let phone = null;
  let confirm = false;

  for (const arg of args) {
    if (arg.startsWith("--email=")) email = arg.split("=")[1].trim().toLowerCase();
    if (arg.startsWith("--phone=")) phone = arg.split("=")[1].trim();
    if (arg === "--confirm") confirm = true;
  }

  return { email, phone, confirm };
}

async function main() {
  const { email, phone, confirm } = parseArgs();

  if (!email && !phone) {
    console.error("[-] Lỗi: Cần cung cấp --email=<email> hoặc --phone=<phone> để xóa dữ liệu.");
    console.error("    Ví dụ: node apps/api/scripts/delete-lead.js --phone=0901234567 [--confirm]");
    process.exit(1);
  }

  console.log(`\n=== THỰC THI YÊU CẦU XÓA DỮ LIỆU CÁ NHÂN (RIGHT TO BE FORGOTTEN) ===`);
  console.log(`Điều kiện tìm kiếm: Email=${email || "N/A"}, SĐT=${phone || "N/A"}`);
  console.log(`Chế độ thực thi: ${confirm ? "🔴 XÓA THẬT (--confirm)" : "🟡 XEM TRƯỚC DRY-RUN (Mặc định)"}\n`);

  try {
    const findQuery = `
      SELECT id, name, phone, email, created_at
      FROM leads
      WHERE ($1::text IS NOT NULL AND email = $1)
         OR ($2::text IS NOT NULL AND phone = $2);
    `;
    const findRes = await directPool.query(findQuery, [email, phone]);
    const leads = findRes.rows;

    if (leads.length === 0) {
      console.log("[✓] Không tìm thấy hồ sơ khách hàng nào phù hợp với thông tin yêu cầu.");
      process.exit(0);
    }

    console.log(`Tìm thấy ${leads.length} bản ghi khách hàng:`);
    for (const lead of leads) {
      const maskedPhone = lead.phone ? lead.phone.slice(0, 3) + "****" + lead.phone.slice(-3) : "N/A";
      console.log(`  - ID: ${lead.id} | Tên: ${lead.name} | SĐT: ${maskedPhone} | Email: ${lead.email || "N/A"}`);
    }

    if (!confirm) {
      console.log("\n⚠️  CẢNH BÁO: Đây là thao tác không thể hoàn tác.");
      console.log("Để xóa vĩnh viễn các hồ sơ trên khỏi hệ thống, vui lòng chạy lại với cờ --confirm:");
      console.log(`node apps/api/scripts/delete-lead.js ${email ? `--email=${email}` : `--phone=${phone}`} --confirm\n`);
      process.exit(0);
    }

    // Xóa thật trong transaction
    const client = await directPool.connect();
    try {
      await client.query("BEGIN");
      for (const lead of leads) {
        await client.query("DELETE FROM leads WHERE id = $1;", [lead.id]);
        logSecurityEvent(
          "privacy_lead_data_erased",
          { lead_id: lead.id, search_term: email || phone },
          "Đã xóa vĩnh viễn dữ liệu khách hàng theo yêu cầu của chủ thể dữ liệu"
        );
      }
      await client.query("COMMIT");
      console.log(`\n[✓] ĐÃ XÓA THÀNH CÔNG ${leads.length} hồ sơ khách hàng và các dữ liệu liên quan khỏi cơ sở dữ liệu.`);
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }

    process.exit(0);
  } catch (err) {
    console.error("[-] Lỗi khi xóa dữ liệu:", err.message);
    process.exit(1);
  } finally {
    await directPool.end();
  }
}

main();
