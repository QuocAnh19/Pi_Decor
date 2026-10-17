import { randomUUID } from "crypto";
import { db } from "../../config/database.js";

export async function seedVenues() {
  const venues = await db.get("venues");
  if (venues.length <= 1) {
    const seedVenues = [
      {
        id: randomUUID(),
        name: "Riverside Resort & Spa Đà Nẵng",
        type: "hotel",
        address: "Đường Bạch Đằng, Quận Hải Châu",
        city: "Đà Nẵng",
        lat: 16.0678,
        lng: 108.2208,
        cover_image: null,
      },
      {
        id: randomUUID(),
        name: "Furama Resort Đà Nẵng",
        type: "resort",
        address: "105 Võ Nguyên Giáp, Ngũ Hành Sơn",
        city: "Đà Nẵng",
        lat: 16.0398,
        lng: 108.2482,
        cover_image: null,
      },
      {
        id: randomUUID(),
        name: "Anantara Hội An Resort",
        type: "resort",
        address: "1 Phạm Hồng Thái, Cẩm Châu",
        city: "Hội An",
        lat: 15.8794,
        lng: 108.335,
        cover_image: null,
      },
      {
        id: randomUUID(),
        name: "InterContinental Danang Sun Peninsula Resort",
        type: "resort",
        address: "Bãi Bắc, Bán đảo Sơn Trà",
        city: "Đà Nẵng",
        lat: 16.1219,
        lng: 108.3069,
        cover_image: null,
      },
      {
        id: randomUUID(),
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
  }
}
