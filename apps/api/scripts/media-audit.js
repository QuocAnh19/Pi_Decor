import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../src/config/env.js";
import { directPool } from "../src/config/database.js";
import { extractCloudinaryPublicId } from "../src/utils/uploadImage.js";

function parseArgs() {
  const args = process.argv.slice(2);
  let deleteOrphans = false;
  let confirm = false;
  let reportPath = "media-audit-report.json";

  for (const arg of args) {
    if (arg === "--delete-orphans") deleteOrphans = true;
    if (arg === "--confirm") confirm = true;
    if (arg.startsWith("--output=")) {
      reportPath = arg.split("=")[1];
    }
  }

  return { deleteOrphans, confirm, reportPath };
}

async function collectDbMediaUrls() {
  const urls = new Set();

  const queries = [
    { table: "projects", cols: ["cover_image", "gallery"] },
    { table: "services", cols: ["cover", "image_url"] },
    { table: "testimonials", cols: ["photos"] },
    { table: "materials", cols: ["image_url"] },
    { table: "venues", cols: ["cover_image"] },
    { table: "studio_templates", cols: ["thumbnail"] },
    { table: "studio_assets", cols: ["thumbnail"] },
  ];

  for (const q of queries) {
    const colList = q.cols.map((c) => (c === "order" ? `"order"` : c)).join(", ");
    try {
      const { rows } = await directPool.query(`SELECT ${colList} FROM ${q.table}`);
      for (const row of rows) {
        for (const col of q.cols) {
          const val = row[col];
          if (!val) continue;
          if (Array.isArray(val)) {
            for (const item of val) {
              if (typeof item === "string" && item.trim()) urls.add(item.trim());
            }
          } else if (typeof val === "string" && val.trim()) {
            urls.add(val.trim());
          }
        }
      }
    } catch (err) {
      console.warn(`[media-audit] Không thể đọc bảng ${q.table}:`, err.message);
    }
  }

  return Array.from(urls);
}

async function fetchCloudinaryAssets(prefix) {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    console.warn("[media-audit] Chưa cấu hình đầy đủ CLOUDINARY credentials.");
    return null;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });

  const assets = [];
  let nextCursor = undefined;

  do {
    const res = await cloudinary.api.resources({
      type: "upload",
      prefix: prefix,
      max_results: 500,
      next_cursor: nextCursor,
    });
    for (const r of res.resources) {
      assets.push({
        public_id: r.public_id,
        secure_url: r.secure_url,
        created_at: r.created_at,
        bytes: r.bytes,
        format: r.format,
      });
    }
    nextCursor = res.next_cursor;
  } while (nextCursor);

  return assets;
}

async function run() {
  const { deleteOrphans, confirm, reportPath } = parseArgs();
  const prefix = env.CLOUDINARY_FOLDER_PREFIX || "pidecor/dev";

  console.log("=== KIỂM TRA ĐỒNG BỘ MEDIA (CLOUDINARY & POSTGRES) ===");
  console.log(`Tiền tố kiểm tra Cloudinary: "${prefix}"`);
  console.log(`Chế độ: ${deleteOrphans && confirm ? "🔴 XÓA ẢNH MỒ CÔI (>7 ngày)" : "🟡 CHỈ BÁO CÁO (Dry-run)"}\n`);

  try {
    const dbUrls = await collectDbMediaUrls();
    console.log(`✓ Đã quét ${dbUrls.length} liên kết media trong cơ sở dữ liệu.`);

    const dbPublicIds = new Set();
    const dbCloudinaryUrls = [];

    for (const u of dbUrls) {
      if (u.includes("cloudinary.com")) {
        dbCloudinaryUrls.push(u);
        const pid = extractCloudinaryPublicId(u);
        if (pid) dbPublicIds.add(pid);
      }
    }

    const cldAssets = await fetchCloudinaryAssets(prefix);

    const report = {
      timestamp: new Date().toISOString(),
      prefix,
      total_db_urls: dbUrls.length,
      total_db_cloudinary_refs: dbCloudinaryUrls.length,
      total_cloudinary_assets: cldAssets ? cldAssets.length : 0,
      orphan_assets: [],
      missing_assets: [],
      deleted_orphans_count: 0,
      dry_run: !(deleteOrphans && confirm),
    };

    if (cldAssets) {
      const cldMap = new Map(cldAssets.map((a) => [a.public_id, a]));

      // 1. Tìm ảnh mồ côi (có trên Cloudinary nhưng không có trong DB)
      for (const asset of cldAssets) {
        if (!dbPublicIds.has(asset.public_id)) {
          report.orphan_assets.push(asset);
        }
      }

      // 2. Tìm ảnh hỏng (được lưu trong DB nhưng không tìm thấy trên Cloudinary)
      for (const url of dbCloudinaryUrls) {
        const pid = extractCloudinaryPublicId(url);
        if (pid && pid.startsWith(prefix) && !cldMap.has(pid)) {
          report.missing_assets.push({ url, public_id: pid });
        }
      }

      console.log(`- Ảnh trên Cloudinary theo prefix: ${cldAssets.length}`);
      console.log(`- Ảnh mồ côi (không có trong DB): ${report.orphan_assets.length}`);
      console.log(`- Ảnh DB bị thiếu trên Cloudinary: ${report.missing_assets.length}`);

      // 3. Thực hiện xóa an toàn nếu có cả 2 cờ
      if (deleteOrphans && confirm) {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        let deleted = 0;
        for (const orphan of report.orphan_assets) {
          const createdAt = new Date(orphan.created_at).getTime();
          // Chỉ xóa ảnh mồ côi đã tạo quá 7 ngày để tránh xóa nhầm ảnh đang upload
          if (createdAt < sevenDaysAgo) {
            try {
              await cloudinary.uploader.destroy(orphan.public_id);
              deleted++;
            } catch (delErr) {
              console.warn(`Lỗi khi xóa ${orphan.public_id}:`, delErr.message);
            }
          }
        }
        report.deleted_orphans_count = deleted;
        console.log(`✓ Đã xóa vĩnh viễn ${deleted} ảnh mồ côi (> 7 ngày).`);
      } else if (report.orphan_assets.length > 0) {
        console.log("\n💡 Để xóa ảnh mồ côi cũ hơn 7 ngày, chạy lệnh:");
        console.log("   npm run media:audit -- --delete-orphans --confirm\n");
      }
    } else {
      console.log("ℹ Bỏ qua kiểm tra Cloudinary do chưa cấu hình API credentials.");
    }

    const resolvedReportPath = path.resolve(reportPath);
    await fs.writeFile(resolvedReportPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`✓ Đã xuất báo cáo tại: ${resolvedReportPath}`);
  } catch (err) {
    console.error("[media-audit] Lỗi thực thi:", err);
    process.exitCode = 1;
  } finally {
    try {
      await directPool.end();
    } catch {
      // ignore
    }
  }
}

run();
