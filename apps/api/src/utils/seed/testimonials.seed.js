import { randomUUID } from "crypto";
import { db } from "../../config/database.js";

export async function seedTestimonials() {
  const testimonials = await db.get("testimonials");
  if (testimonials.length === 0) {
    const seedTestimonials = [
      {
        id: randomUUID(),
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
        id: randomUUID(),
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
        id: randomUUID(),
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
