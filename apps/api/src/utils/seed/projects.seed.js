import { db } from "../../config/database.js";
import { portfolioSeed } from "../../data/portfolio.seed.js";

export async function seedProjects() {
  const currentVenues = await db.get("venues");
  const furamaVenue = currentVenues.find((v) => v.name.includes("Furama"));
  const existingProjects = await db.get("projects");
  const existingTitles = new Set(existingProjects.map((p) => p.title));

  let newProjectsCount = 0;

  // 1. Chèn các dự án portfolio thực tế
  for (const proj of portfolioSeed) {
    if (!existingTitles.has(proj.title)) {
      const matchedVenue = proj.location?.includes("Furama") ? furamaVenue : null;
      await db.insert("projects", {
        ...proj,
        venue_id: matchedVenue?.id || null,
      });
      existingTitles.add(proj.title);
      newProjectsCount++;
    }
  }

  // 2. Chèn các dự án mẫu gắn theo từng venue nếu chưa tồn tại
  if (currentVenues.length > 0) {
    const demoVenueProjects = [
      {
        venue_id: currentVenues[0]?.id || null,
        title: "Tiệc cưới tông Hồng Phấn & Champagne",
        wedding_date: "2026-02-14",
        style_tags: ["romantic", "pastel"],
        cover_image: null,
        gallery: [],
        lead_id: null,
        published: true,
        price_tier: "standard",
        status: "active",
      },
      {
        venue_id: currentVenues[0]?.id || null,
        title: "Sảnh tiệc phong cách Vintage Xanh Khói",
        wedding_date: "2025-11-02",
        style_tags: ["vintage", "moody"],
        cover_image: null,
        gallery: [],
        lead_id: null,
        published: true,
        price_tier: "standard",
        status: "active",
      },
      {
        venue_id: currentVenues[1]?.id || null,
        title: "Đám cưới bãi biển phong cách Boho Tropical",
        wedding_date: "2026-04-20",
        style_tags: ["beach", "tropical", "boho"],
        cover_image: null,
        gallery: [],
        lead_id: null,
        published: true,
        price_tier: "standard",
        status: "active",
      },
      {
        venue_id: currentVenues[2]?.id || null,
        title: "Tiệc cưới sân vườn bên sông Thu Bồn",
        wedding_date: "2025-12-18",
        style_tags: ["garden", "rustic", "heritage"],
        cover_image: null,
        gallery: [],
        lead_id: null,
        published: true,
        price_tier: "standard",
        status: "active",
      },
      {
        venue_id: currentVenues[3]?.id || null,
        title: "Lễ cưới Hoàng Gia giữa Vịnh Sơn Trà",
        wedding_date: "2026-01-10",
        style_tags: ["luxury", "oceanview"],
        cover_image: null,
        gallery: [],
        lead_id: null,
        published: true,
        price_tier: "premium",
        status: "active",
      },
      {
        venue_id: currentVenues[4]?.id || null,
        title: "Đêm tiệc sang trọng Grand Ballroom",
        wedding_date: "2025-10-15",
        style_tags: ["modern", "glamour"],
        cover_image: null,
        gallery: [],
        lead_id: null,
        published: true,
        price_tier: "premium",
        status: "active",
      },
    ];

    for (const demoProj of demoVenueProjects) {
      if (!existingTitles.has(demoProj.title)) {
        await db.insert("projects", demoProj);
        existingTitles.add(demoProj.title);
        newProjectsCount++;
      }
    }
  }

  if (newProjectsCount > 0) {
    console.log(`✓ Seeded ${newProjectsCount} projects (idempotent check by title).`);
  }
}
