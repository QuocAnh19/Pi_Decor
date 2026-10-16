import { pool } from "../src/config/database.js";
import { logger } from "../src/config/logger.js";

function parseArgs() {
  const args = process.argv.slice(2);
  let days = 180; // Giá trị mặc định: 180 ngày (6 tháng)
  let confirm = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--older-than-days=")) {
      const parsed = parseInt(arg.split("=")[1], 10);
      if (!isNaN(parsed) && parsed > 0) days = parsed;
    } else if (arg === "--older-than-days" || arg === "-d") {
      const next = parseInt(args[i + 1], 10);
      if (!isNaN(next) && next > 0) {
        days = next;
        i++;
      }
    } else if (arg.startsWith("-d=")) {
      const parsed = parseInt(arg.split("=")[1], 10);
      if (!isNaN(parsed) && parsed > 0) days = parsed;
    } else if (arg === "--confirm") {
      confirm = true;
    }
  }

  return { days, confirm };
}

function maskPhone(phone) {
  if (!phone || phone.length < 4) return "****";
  return phone.slice(0, 3) + "****" + phone.slice(-3);
}

function maskName(name) {
  if (!name || name.length <= 2) return "**";
  return name[0] + "***" + name.slice(-1);
}

async function main() {
  const { days, confirm } = parseArgs();

  console.log(`\n=== CHƯƠNG TRÌNH THANH LỌC DỮ LIỆU KHÁCH HÀNG (PURGE LEADS) ===`);
  console.log(`Thời gian lưu trữ tối đa: ${days} ngày.`);
  console.log(`Chế độ thực thi: ${confirm ? "🔴 XÓA THẬT (--confirm)" : "🟡 XEM TRƯỚC DRY-RUN (Mặc định)"}\n`);

  try {
    const checkQuery = `
      SELECT id, name, phone, email, created_at, consent_at
      FROM leads
      WHERE created_at < NOW() - make_interval(days => $1)
      ORDER BY created_at ASC
    `;
    const checkRes = await pool.query(checkQuery, [days]);
    const leads = checkRes.rows;

    if (leads.length === 0) {
      console.log(`✓ Không có bản ghi lead nào cũ hơn ${days} ngày. Không cần xử lý.`);
      return;
    }

    console.log(`Tìm thấy ${leads.length} bản ghi lead đủ điều kiện xóa:`);
    leads.slice(0, 10).forEach((l, idx) => {
      console.log(
        `  ${idx + 1}. [${l.id}] ${maskName(l.name)} | ${maskPhone(l.phone)} | Ngày tạo: ${new Date(l.created_at).toISOString().slice(0, 10)}`
      );
    });
    if (leads.length > 10) {
      console.log(`  ... và ${leads.length - 10} bản ghi khác.`);
    }

    if (!confirm) {
      console.log(
        `\n⚠️  [DRY RUN]: Chưa có bản ghi nào bị xóa khỏi cơ sở dữ liệu.`
      );
      console.log(
        `   Để thực hiện xóa thật, vui lòng chạy lại với cờ --confirm:\n   npm run purge-leads -- --older-than-days=${days} --confirm\n`
      );
    } else {
      const deleteQuery = `
        DELETE FROM leads
        WHERE created_at < NOW() - make_interval(days => $1)
        RETURNING id
      `;
      const deleteRes = await pool.query(deleteQuery, [days]);
      console.log(
        `\n✓ [THÀNH CÔNG]: Đã xóa vĩnh viễn ${deleteRes.rows.length} bản ghi lead cũ hơn ${days} ngày tuân thủ chính sách lưu trữ.\n`
      );
    }
  } catch (err) {
    logger.error({ err }, "Lỗi khi chạy lệnh purge-leads");
    console.error("Lỗi:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
