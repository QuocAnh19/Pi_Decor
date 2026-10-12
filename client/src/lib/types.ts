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
export interface GalleryItemObject {
  url: string;
  span?: string; // 'span2x3' | 'span1x2' | 'span2x1' | 'span2x2' | 'span1x1' | 'span3x2'
}

export interface CategoryPortfolioItem {
  id: string;
  categoryId: string; // ServiceCategory.id
  tag: string; // must match one of that category's `items`
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

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
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
  venue_id?: string | null;
  title: string;
  wedding_date: string | null;
  style_tags: string[];
  cover_image: string | null;
  gallery: string[];
  lead_id: string | null;
  published: boolean;
  location?: string | null;
  description?: string | null;
  budget?: string | null;
  status?: string | null;
  category_id?: string | null;
  tag?: string | null;
  price_tier?: "standard" | "premium" | null;
  created_at?: string;
}

export interface VenueDetail extends Venue {
  projects: Project[];
}

// ── Admin (PiDecor_AdminPanel.md) ───────────────────────────────────────

export interface Admin {
  id: string;
  email: string;
  role?: "owner" | "admin";
  created_at?: string;
}

export type LeadStatus = "new" | "contacted" | "closed";

/**
 * Mirrors `buildDesignSnapshot()` in `BuilderShell.tsx` — what a Studio
 * "Lưu thiết kế" submission looks like. It's produced entirely on the
 * client and stored as-is by the API, so fields are optional here and the
 * UI (LeadDetailDrawer) renders defensively around missing pieces.
 */
export interface DesignSnapshot {
  preview_image?: string;
  thumbnail?: string;
  baseFabric?: { style?: string; color?: string; hex?: string } | null;
  valance?: { style?: string; color?: string; enabled?: boolean } | null;
  flowers?: Record<string, { slot: string; shape: string; tone: string } | null>;
  details?: {
    monogram?: { enabled: boolean; text: string };
    ribbon?: boolean;
    lights?: boolean;
  };
  [key: string]: unknown;
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

export interface PaginatedLeadsResponse {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminSummary {
  leads_total: number;
  leads_new: number;
  designs_total: number;
  materials_total: number;
  services_total: number;
  venues_total: number;
  projects_published_total: number;
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
  price_tier?: "standard" | "premium" | null;
}

// ── Quotations ────────────────────────────────────────────────────────────


export type QuotationStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

export interface QuotationItem {
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Quotation {
  id: string;
  lead_id: string;
  admin_id: string | null;
  quotation_number: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: QuotationStatus;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationPayload {
  lead_id: string;
  items: Omit<QuotationItem, "subtotal">[];
  discount?: number;
  valid_until?: string | null;
  notes?: string | null;
}

// ── Testimonials & Moderation ────────────────────────────────────────────

export type TestimonialStatus = "pending" | "approved" | "rejected";
export type TestimonialSource = "customer" | "admin_seed";

export interface TestimonialItem {
  id: string;
  lead_id?: string | null;
  author: string;
  role?: string | null;
  quote: string;
  rating: number;
  photos: string[];
  status?: TestimonialStatus;
  source?: TestimonialSource;
  created_at?: string;
  updated_at?: string;
}

export interface TestimonialPayload {
  author: string;
  role?: string;
  quote: string;
  rating?: number;
  photos?: string[];
  lead_id?: string;
}

// ── Studio DB Rows (Backend Response Shapes) ──────────────────────────────

export interface StudioTemplateRow {
  id: string;
  name: string;
  thumbnail: string | null;
  svg_base: string;
  category: string | null;
  is_active: boolean;
  default_config?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface StudioSlotDefinitionRow {
  id: string;
  template_id: string;
  slot_key: string;
  label: string;
  slot_type: string;
  norm_x: number;
  norm_y: number;
  norm_width: number | null;
  norm_height: number | null;
  allow_scale: boolean;
  allow_rotate: boolean;
  mirror_x: boolean;
  z_index: number;
  sort_order: number;
  required: boolean;
}

export interface StudioAssetRow {
  id: string;
  asset_type: string;
  name: string;
  thumbnail: string | null;
  svg_data: string | null;
  color_hex: string | null;
  font_family: string | null;
  tags: string[];
  is_active: boolean;
  dominant_colors: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface StudioSlotRuleRow {
  id: string;
  template_id: string;
  rule_name: string | null;
  condition_slot: string;
  condition_value: Record<string, unknown>;
  target_slot: string;
  action: "force_asset" | "restrict_assets" | "hide_slot";
  action_value: Record<string, unknown> | null;
  priority: number;
}
