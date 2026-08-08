import "dotenv/config";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { db } from "../config/database.js";

async function seed() {
  const admins = await db.get("admins");
  const email = process.env.ADMIN_EMAIL ?? "admin@pidecor.vn";

  const existingAdmin = admins.find((a) => a.email === email);
  const password_hash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "admin123", 10);
  if (!existingAdmin) {
    await db.insert("admins", { id: uuid(), email, password_hash });
    console.log(`✓ Admin account created: ${email}`);
  } else {
    await db.update("admins", (a) => a.email === email, { password_hash });
    console.log(`✓ Admin account password updated: ${email}`);
  }

  const materials = await db.get("materials");
  if (materials.length === 0) {
    const seedMaterials = [
      { id: uuid(), name: "Hồng Phấn", category: "fabric", color_hex: "#E7B6BB", image_url: null },
      { id: uuid(), name: "Rêu Nhạt", category: "fabric", color_hex: "#AFC49C", image_url: null },
      { id: uuid(), name: "Vàng Cát", category: "fabric", color_hex: "#C99F6F", image_url: null },
      { id: uuid(), name: "Oải Hương", category: "fabric", color_hex: "#B98AC9", image_url: null },
      { id: uuid(), name: "Champagne", category: "fabric", color_hex: "#E7BE79", image_url: null },
      { id: uuid(), name: "Xanh Khói", category: "fabric", color_hex: "#8A9BAE", image_url: null },
    ];
    await db.set("materials", seedMaterials);
    console.log(`✓ Seeded ${seedMaterials.length} materials.`);
  }

  const services = await db.get("services");
  if (services.length === 0) {
    const seedServices = [
      { id: uuid(), title: "Interactive Studio", description: "Chọn vải voan, cụm hoa, cổng hoa và xem thay đổi theo thời gian thực.", image_url: null, order: 0 },
      { id: uuid(), title: "Wedding Decor", description: "Trang trí sảnh tiệc trọn gói theo phong cách riêng của bạn.", image_url: null, order: 1 },
      { id: uuid(), title: "Wedding Planner", description: "Lên kế hoạch chi tiết từng hạng mục, đúng tiến độ.", image_url: null, order: 2 },
      { id: uuid(), title: "Gia Tiên & Mâm Quả", description: "Không gian truyền thống, chỉn chu theo đúng nghi lễ.", image_url: null, order: 3 },
      { id: uuid(), title: "Tiệc Ngoài Trời", description: "Decor sân vườn, rooftop — lãng mạn giữa thiên nhiên.", image_url: null, order: 4 },
    ];
    await db.set("services", seedServices);
    console.log(`✓ Seeded ${seedServices.length} services.`);
  }

  // Bản đồ dự án đã thực hiện (PiDecor_MappingProject.md, mốc M1) — 1 venue
  // mẫu để demo pin + click-to-show-projects ngay. Đây là DỮ LIỆU DEMO —
  // thay bằng địa điểm/dự án thật của bạn qua API /api/admin/venues, hoặc
  // sửa trực tiếp trong server/src/data/db.json trước khi lên production.
  const venues = await db.get("venues");
  if (venues.length <= 1) {
    const seedVenues = [
      {
        id: uuid(),
        name: "Riverside Resort & Spa Đà Nẵng",
        type: "hotel",
        address: "Đường Bạch Đằng, Quận Hải Châu",
        city: "Đà Nẵng",
        lat: 16.0678,
        lng: 108.2208,
        cover_image: null,
      },
      {
        id: uuid(),
        name: "Furama Resort Đà Nẵng",
        type: "resort",
        address: "105 Võ Nguyên Giáp, Ngũ Hành Sơn",
        city: "Đà Nẵng",
        lat: 16.0398,
        lng: 108.2482,
        cover_image: null,
      },
      {
        id: uuid(),
        name: "Anantara Hội An Resort",
        type: "resort",
        address: "1 Phạm Hồng Thái, Cẩm Châu",
        city: "Hội An",
        lat: 15.8794,
        lng: 108.335,
        cover_image: null,
      },
      {
        id: uuid(),
        name: "InterContinental Danang Sun Peninsula Resort",
        type: "resort",
        address: "Bãi Bắc, Bán đảo Sơn Trà",
        city: "Đà Nẵng",
        lat: 16.1219,
        lng: 108.3069,
        cover_image: null,
      },
      {
        id: uuid(),
        name: "Gem Center TPHCM",
        type: "sảnh tiệc",
        address: "8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1",
        city: "TP. Hồ Chí Minh",
        lat: 10.7872,
        lng: 106.7025,
        cover_image: null,
      },
    ];
    await db.set("venues", seedVenues);
    console.log(`✓ Seeded ${seedVenues.length} venues.`);

    const seedProjects = [
      {
        id: uuid(),
        venue_id: seedVenues[0].id,
        title: "Tiệc cưới tông Hồng Phấn & Champagne",
        wedding_date: "2026-02-14",
        style_tags: ["romantic", "pastel"],
        cover_image: null,
        gallery: [],
        lead_id: null,
        published: true,
      },
      {
        id: uuid(),
        venue_id: seedVenues[0].id,
        title: "Sảnh tiệc phong cách Vintage Xanh Khói",
        wedding_date: "2025-11-02",
        style_tags: ["vintage", "moody"],
        cover_image: null,
        gallery: [],
        lead_id: null,
        published: true,
      },
      {
        id: uuid(),
        venue_id: seedVenues[1].id,
        title: "Đám cưới bãi biển phong cách Boho Tropical",
        wedding_date: "2026-04-20",
        style_tags: ["beach", "tropical", "boho"],
        cover_image: null,
        gallery: [],
        lead_id: null,
        published: true,
      },
      {
        id: uuid(),
        venue_id: seedVenues[2].id,
        title: "Tiệc cưới sân vườn bên sông Thu Bồn",
        wedding_date: "2025-12-18",
        style_tags: ["garden", "rustic", "heritage"],
        cover_image: null,
        gallery: [],
        lead_id: null,
        published: true,
      },
      {
        id: uuid(),
        venue_id: seedVenues[3].id,
        title: "Lễ cưới Hoàng Gia giữa Vịnh Sơn Trà",
        wedding_date: "2026-01-10",
        style_tags: ["luxury", "oceanview"],
        cover_image: null,
        gallery: [],
        lead_id: null,
        published: true,
      },
      {
        id: uuid(),
        venue_id: seedVenues[4].id,
        title: "Đêm tiệc sang trọng Grand Ballroom",
        wedding_date: "2025-10-15",
        style_tags: ["modern", "glamour"],
        cover_image: null,
        gallery: [],
        lead_id: null,
        published: true,
      },
    ];
    await db.set("projects", seedProjects);
    console.log(`✓ Seeded ${seedProjects.length} projects.`);
  }

  const testimonials = await db.get("testimonials");
  if (testimonials.length === 0) {
    const seedTestimonials = [
      {
        id: uuid(),
        author: "Thu Hà",
        role: "Cô dâu, TP.HCM · PiWedding",
        quote: "Mình tự tay thử màu vải trước cả tuần, đến ngày cưới đúng y như hình dung.",
        rating: 5,
        photos: [],
        status: "approved",
        source: "admin_seed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuid(),
        author: "Minh & Anh",
        role: "Ba mẹ bé Tôm, Hà Nội · PiKids",
        quote: "Đặt tiệc thôi nôi cho con mà vẫn chọn được đúng tông pastel mình thích, nhanh gọn.",
        rating: 5,
        photos: [],
        status: "approved",
        source: "admin_seed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuid(),
        author: "Ngọc Linh",
        role: "Quản lý thương hiệu, Đà Nẵng · PiEvent",
        quote: "Đội thi công dựng đúng 100% timeline sự kiện khai trương, không lệch một khâu nào.",
        rating: 5,
        photos: [],
        status: "approved",
        source: "admin_seed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    await db.set("testimonials", seedTestimonials);
    console.log(`✓ Seeded ${seedTestimonials.length} testimonials.`);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Seed thất bại:", err);
    process.exit(1);
  });
