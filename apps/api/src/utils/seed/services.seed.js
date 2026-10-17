import { db } from "../../config/database.js";

export async function seedServices() {
  const services = await db.get("services");
  const isOutdated = services.some((s) => s.title === "Interactive Studio" || !s.brand);
  if (services.length === 0 || isOutdated) {
    const seedServices = [
      {
        id: "00000000-0000-0000-0000-000000000001",
        brand: "PiWedding",
        title: "Không gian cưới trong mơ",
        tagline: "Kiến tạo không gian — lưu giữ khoảnh khắc",
        description:
          "Từ lễ gia tiên ấm cúng đến sảnh tiệc lộng lẫy — tự tay phối vải, hoa, cổng cưới trên Studio trước khi chốt, hoặc để đội Pi Decor lo trọn gói.",
        icon: "HeartIcon",
        accent: "wedding",
        items: ["Gia Tiên", "Nhà Hàng", "Ngoài Trời", "Nhà Rạp"],
        href: "/studio",
        cta_label: "Vào Studio thiết kế",
        featured: true,
        cover: "/images/service-piwedding.png",
        order: 0,
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        brand: "PiKids",
        title: "Dấu mốc đầu đời",
        tagline: "Rực rỡ như tuổi thơ",
        description:
          "Đầy tháng, thôi nôi, sinh nhật và những buổi party nhỏ — decor ngọt ngào, đúng tông, đúng tuổi của con.",
        icon: "SparklesIcon",
        accent: "kids",
        items: ["Đầy Tháng", "Thôi Nôi", "Sinh Nhật", "Party"],
        href: null,
        cta_label: "Liên hệ tư vấn",
        featured: false,
        cover: "/images/service-pikids.png",
        order: 1,
      },
      {
        id: "00000000-0000-0000-0000-000000000003",
        brand: "PiEvent",
        title: "Sự kiện & thương hiệu",
        tagline: "Chuyên nghiệp, đúng dấu ấn doanh nghiệp",
        description:
          "Khai trương, lễ Tết, sum up cuối năm, team building — set up nhanh gọn, hình ảnh chỉn chu cho mọi quy mô sự kiện.",
        icon: "BuildingOffice2Icon",
        accent: "event",
        items: ["Khai Trương", "Lễ - Tết", "Sum Up", "Team Building"],
        href: null,
        cta_label: "Liên hệ tư vấn",
        featured: false,
        cover: "/images/service-pievent.png",
        order: 2,
      },
    ];
    await db.set("services", seedServices);
    console.log(
      `✓ Seeded ${seedServices.length} real brand services (PiWedding, PiKids, PiEvent).`
    );
  }
}
