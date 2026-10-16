import { z } from "zod";

/**
 * Trạng thái xử lý khách hàng tiềm năng (Leads).
 */
export const leadStatusEnum = z.enum(["new", "contacted", "closed"]);
export type LeadStatus = z.infer<typeof leadStatusEnum>;

/**
 * Trạng thái vòng đời báo giá (Quotations).
 */
export const quotationStatusEnum = z.enum(["draft", "sent", "accepted", "declined", "expired"]);
export type QuotationStatus = z.infer<typeof quotationStatusEnum>;

/**
 * Trạng thái kiểm duyệt đánh giá khách hàng (Testimonials).
 */
export const testimonialStatusEnum = z.enum(["pending", "approved", "rejected"]);
export type TestimonialStatus = z.infer<typeof testimonialStatusEnum>;

/**
 * Vai trò tài khoản quản trị (Admins).
 */
export const adminRoleEnum = z.enum(["owner", "admin"]);
export type AdminRole = z.infer<typeof adminRoleEnum>;

/**
 * Phân loại loại hình địa điểm (Venues).
 */
export const venueTypeEnum = z.enum(["hotel", "restaurant", "resort", "sảnh tiệc"]);
export type VenueType = z.infer<typeof venueTypeEnum>;

/**
 * Phân loại hoạt động chăm sóc lead (Lead Activities).
 */
export const leadActivityTypeEnum = z.enum(["note", "call", "email"]);
export type LeadActivityType = z.infer<typeof leadActivityTypeEnum>;
