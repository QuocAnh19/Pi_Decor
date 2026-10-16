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
  consent?: boolean;
  consent_version?: string;
}
