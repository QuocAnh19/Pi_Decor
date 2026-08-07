export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide-react icon name, resolved in ServiceCard
  href?: string;
}

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
  icon: string; // lucide-react icon name
  accent: ServiceAccent;
  items: string[]; // sub-services, e.g. ["Đầy tháng", "Thôi nôi", ...]
  href?: string; // e.g. "/studio" for PiWedding's Interactive Studio
  ctaLabel: string;
  featured?: boolean; // gets the large bento slot
  /** Full-bleed card background photo. Path relative to /public, e.g. "/images/service-pikids.jpg". */
  cover: string | null;
}

/**
 * One completed job shown inside a service category's detail modal,
 * tagged to exactly one of that category's `items` (e.g. "Thôi Nôi") so
 * the modal can filter "các dự án đã làm" by sub-service.
 */
export interface CategoryPortfolioItem {
  id: string;
  categoryId: string; // ServiceCategory.id
  tag: string; // must match one of that category's `items`
  title: string;
  location?: string;
  /** Path relative to /public. Leave null until the real photo is dropped in. */
  src: string | null;
}

export interface FabricSwatch {
  id: string;
  label: string;
  hex: string;
}

export interface ToolCategory {
  id: string;
  label: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
}

export interface LookbookItem {
  id: string;
  tag: string;
  /** Path relative to /public, e.g. "/images/lookbook-sen-hong.jpg". Leave null until the real photo is dropped in. */
  src: string | null;
}

export interface HeroMedia {
  /** Path relative to /public, e.g. "/images/hero.jpg" or "/images/hero.mp4" */
  src: string | null;
  alt: string;
}

// ── Bản đồ dự án đã thực hiện (PiDecor_MappingProject.md) ──────────────────

export type VenueType = "hotel" | "restaurant" | "resort" | "sảnh tiệc";

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  address: string | null;
  city: string | null;
  lat: number;
  lng: number;
  cover_image: string | null;
  /** Derived server-side from published projects — never stored. */
  project_count: number;
}

export interface Project {
  id: string;
  venue_id: string;
  title: string;
  wedding_date: string | null;
  style_tags: string[];
  cover_image: string | null;
  gallery: string[];
  lead_id: string | null;
  published: boolean;
}

export interface VenueDetail extends Venue {
  projects: Project[];
}

// ── Admin (PiDecor_AdminPanel.md) ───────────────────────────────────────

export interface Admin {
  id: string;
  email: string;
}

export type LeadStatus = "new" | "contacted" | "closed";

/**
 * Mirrors `buildDesignSnapshot()` in `BuilderShell.tsx` — what a Studio
 * "Lưu thiết kế" submission looks like. It's produced entirely on the
 * client and stored as-is by the API, so fields are optional here and the
 * UI (LeadDetailDrawer) renders defensively around missing pieces.
 */
export interface DesignSnapshot {
  baseFabric: { style?: string; color?: string; hex?: string } | null;
  valance: { style?: string; color?: string; enabled?: boolean } | null;
  flowers: Record<string, { slot: string; shape: string; tone: string } | null>;
  details: {
    monogram: { enabled: boolean; text: string };
    ribbon: boolean;
    lights: boolean;
  };
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  wedding_date: string | null;
  message: string | null;
  design_snapshot: DesignSnapshot | null;
  status: LeadStatus;
  created_at: string;
}

export interface AdminSummary {
  leads_total: number;
  leads_new: number;
  designs_total: number;
  materials_total: number;
  services_total: number;
}

export interface VenuePayload {
  name: string;
  type: VenueType;
  address?: string | null;
  city?: string | null;
  lat: number;
  lng: number;
  cover_image?: string | null;
}

export interface ProjectPayload {
  title: string;
  wedding_date?: string | null;
  style_tags?: string[];
  cover_image?: string | null;
  gallery?: string[];
  lead_id?: string | null;
  published?: boolean;
}
