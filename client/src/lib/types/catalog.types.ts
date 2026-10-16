/**
 * The 3 real product lines Pi Decor operates under (from the physical
 * business card): PiKids, PiWedding, PiEvent. Each is its own brand
 * "chấm phá" (accent daub) on the homepage — distinct tone, distinct
 * icon, distinct sub-services — while sharing one visual language.
 */
export type ServiceAccent = "kids" | "wedding" | "event";

export interface ServiceCategory {
  id: string;
  brand: string; // "PiKids" / "PiWedding" / "PiEvent"
  title: string; // human section title, e.g. "Dấu mốc đầu đời"
  tagline: string;
  description: string;
  icon: string; // Heroicons icon name
  accent: ServiceAccent;
  items: string[]; // sub-services, e.g. ["Đầy tháng", "Thôi nôi", ...]
  href?: string | null; // e.g. "/studio" for PiWedding's Interactive Studio
  ctaLabel: string;
  featured?: boolean; // gets the large bento slot
  /** Full-bleed card background photo. Path relative to /public, e.g. "/images/service-pikids.jpg". */
  cover: string | null;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * One completed job shown inside a service category's detail modal,
 * tagged to exactly one of that category's `items` (e.g. "Thôi Nôi") so
 * the modal can filter "các dự án đã làm" by sub-service.
 */
export interface GalleryItemObject {
  url: string;
  span?: string; // 'span2x3' | 'span1x2' | 'span2x1' | 'span2x2' | 'span1x1' | 'span3x2'
}

export interface CategoryPortfolioItem {
  id: string;
  categoryId: string; // ServiceCategory.id
  tag: string; // must match one of that category's items
  title: string;
  location?: string;
  /** Path relative to /public. Leave null until the real photo is dropped in. */
  src: string | null;
  /** Array of secondary photo paths or objects with custom frame sizes. */
  gallery?: (string | GalleryItemObject)[];
  priceTier?: "standard" | "premium" | string;
  featured?: boolean;
  status?: string;
}

export interface HeroMedia {
  /** Path relative to /public, e.g. "/images/hero.jpg" or "/images/hero.mp4" */
  src: string | null;
  alt: string;
}

// ── Materials Catalog ──────────────────────────────────────────────────

export interface MaterialItem {
  id: string;
  name: string;
  category: string;
  color_hex: string | null;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
}
