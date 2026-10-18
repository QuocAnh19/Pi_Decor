import { directPool } from "../src/config/database.js";

function parseArgs() {
  const args = process.argv.slice(2);
  let email = null;
  let phone = null;

  for (const arg of args) {
    if (arg.startsWith("--email=")) email = arg.split("=")[1].trim().toLowerCase();
    if (arg.startsWith("--phone=")) phone = arg.split("=")[1].trim();
  }

  return { email, phone };
}

async function main() {
  const { email, phone } = parseArgs();

  if (!email && !phone) {
    console.error("[-] Lỗi: Cần cung cấp --email=<email> hoặc --phone=<phone> để trích xuất dữ liệu.");
    console.error("    Ví dụ: node apps/api/scripts/export-lead.js --phone=0901234567");
    process.exit(1);
  }

  try {
    const leadQuery = `
      SELECT id, name, phone, email, wedding_date, message, status, design_snapshot, created_at, consent_at, consent_version
      FROM leads
      WHERE ($1::text IS NOT NULL AND email = $1)
         OR ($2::text IS NOT NULL AND phone = $2)
      ORDER BY created_at DESC;
    `;
    const leadRes = await directPool.query(leadQuery, [email, phone]);
    const leads = leadRes.rows;

    if (leads.length === 0) {
      console.log(JSON.stringify({ message: "Không tìm thấy hồ sơ khách hàng phù hợp.", leads: [] }, null, 2));
      process.exit(0);
    }

    const exportedData = [];
    for (const lead of leads) {
      const [activitiesRes, quotationsRes] = await Promise.all([
        directPool.query(
          "SELECT id, activity_type, body, metadata, created_at FROM lead_activities WHERE lead_id = $1 ORDER BY created_at ASC",
          [lead.id]
        ),
        directPool.query(
          "SELECT id, quotation_number, items, subtotal, discount, total, status, valid_until, created_at FROM quotations WHERE lead_id = $1 ORDER BY created_at ASC",
          [lead.id]
        ),
      ]);

      exportedData.push({
        lead_profile: lead,
        timeline_activities: activitiesRes.rows,
        quotations: quotationsRes.rows,
      });
    }

    console.log(JSON.stringify({ export_date: new Date().toISOString(), total_leads: leads.length, data: exportedData }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("[-] Lỗi khi trích xuất dữ liệu:", err.message);
    process.exit(1);
  } finally {
    await directPool.end();
  }
}

main();
