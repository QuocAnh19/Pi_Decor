import { randomUUID } from "crypto";
import { db } from "../../config/database.js";

export async function seedMaterials() {
  const materials = await db.get("materials");
  if (materials.length === 0) {
    const seedMaterials = [
      {
        id: randomUUID(),
        name: "Hồng Phấn",
        category: "fabric",
        color_hex: "#E7B6BB",
        image_url: null,
      },
      {
        id: randomUUID(),
        name: "Rêu Nhạt",
        category: "fabric",
        color_hex: "#AFC49C",
        image_url: null,
      },
      {
        id: randomUUID(),
        name: "Vàng Cát",
        category: "fabric",
        color_hex: "#C99F6F",
        image_url: null,
      },
      {
        id: randomUUID(),
        name: "Oải Hương",
        category: "fabric",
        color_hex: "#B98AC9",
        image_url: null,
      },
      {
        id: randomUUID(),
        name: "Champagne",
        category: "fabric",
        color_hex: "#E7BE79",
        image_url: null,
      },
      {
        id: randomUUID(),
        name: "Xanh Khói",
        category: "fabric",
        color_hex: "#8A9BAE",
        image_url: null,
      },
    ];
    await db.set("materials", seedMaterials);
    console.log(`✓ Seeded ${seedMaterials.length} materials.`);
  }
}
