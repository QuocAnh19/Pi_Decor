export interface ProjectItem {
  id: string;
  categoryId: string; // 'piwedding' | 'pikids' | 'pievent'
  tag: string; // 'Gia Tiên' | 'Nhà Hàng' | 'Ngoài Trời' | 'Đầy Tháng' | 'Thôi Nôi' | 'Khai Trương'...
  title: string;
  location: string;
  src: string;
  gallery?: (string | { url: string; span?: string })[];
  description?: string;
  date?: string;
  budget?: string;
  status?: "active" | "featured" | "draft";
  createdAt?: number;
  venue_id?: string;
}

export interface SlotDesc {
  label: string;
  spanKey: string;
  hint: string;
}

export const SAMPLE_STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600",
  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600",
];

export const CATEGORY_TAG_OPTIONS: Record<string, string[]> = {
  piwedding: ["Gia tiên", "Nhà hàng", "Ngoài trời", "Nhà rạp"],
  pikids: ["Đầy tháng", "Thôi nôi", "Sinh nhật", "Party"],
  pievent: ["Khai trương", "Lễ - Tết", "Sum Up", "Team Building"],
};

export const ASYMMETRIC_SLOT_DESCS: SlotDesc[] = [
  { label: "Khung 1 (Hero 2x3)", spanKey: "span2x3", hint: "Ảnh đại diện lớn 2x3" },
  { label: "Khung 2 (Dọc 1x2)", spanKey: "span1x2", hint: "Ảnh đứng 1x2" },
  { label: "Khung 3 (Ngang 2x1)", spanKey: "span2x1", hint: "Ảnh ngang 2x1" },
  { label: "Khung 4 (Dọc cao slim 1x3)", spanKey: "span1x3", hint: "Mới: Khung đứng cao 1x3" },
  { label: "Khung 5 (Nổi bật 2x2)", spanKey: "span2x2", hint: "Ảnh vuông vừa 2x2" },
  { label: "Khung 6 (Banner 4x2)", spanKey: "span4x2", hint: "Mới: Banner toàn chiều rộng 4x2" },
  { label: "Khung 7 (Vuông nhỏ 1x1)", spanKey: "span1x1", hint: "Ảnh nhỏ 1x1" },
  { label: "Khung 8 (Panorama 3x2)", spanKey: "span3x2", hint: "Ảnh rộng 3x2" },
  { label: "Khung 9 (Dọc 1x2)", spanKey: "span1x2", hint: "Ảnh đứng 1x2" },
  { label: "Khung 10 (Nổi bật 2x2)", spanKey: "span2x2", hint: "Ảnh vuông vừa 2x2" },
];

export function dbToProjectItem(item: any): ProjectItem {
  const tags = Array.isArray(item.style_tags) ? item.style_tags : [];
  const gallery = Array.isArray(item.gallery) ? item.gallery : [];
  return {
    id: String(item.id),
    title: item.title ?? "Dự án mới",
    categoryId: item.category_id ?? tags[0] ?? "piwedding",
    tag: item.tag ?? tags[1] ?? "Gia Tiên",
    location: item.location ?? "Tư gia, Đà Nẵng",
    src: item.cover_image ?? SAMPLE_STOCK_IMAGES[0],
    gallery,
    description: item.description ?? "",
    date: item.wedding_date ? String(item.wedding_date).split("T")[0] : "",
    budget: item.budget ?? "Thỏa thuận",
    status: item.status ?? (item.published === false ? "draft" : "active"),
    createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
    venue_id: item.venue_id,
  };
}
