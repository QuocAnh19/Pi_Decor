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
  template_id?: string;
  template_name?: string;
  slot_config?: Record<string, unknown>;
  custom_slots?: unknown[];
  saved_by?: "customer" | "admin" | string;
  saved_at?: string;
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
  consent_at?: string | null;
  consent_version?: string | null;
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
