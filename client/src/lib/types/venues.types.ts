import type { GalleryItemObject } from "./catalog.types";

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
  gallery: (string | GalleryItemObject)[];
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
