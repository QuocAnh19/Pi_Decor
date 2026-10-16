import type { Project, CategoryPortfolioItem, GalleryItemObject } from "../types";
import type { ProjectItem } from "../../features/projects";
import { SAMPLE_STOCK_IMAGES } from "../../features/projects";

const DEFAULT_PORTFOLIO_FALLBACK = "/images/portfolio/piwedding-gia-tien-1.jpg";

/**
 * Xác định ảnh bìa hiển thị từ cover_image hoặc phần tử đầu tiên của gallery.
 */
export function resolveProjectCover(
  cover: string | null | undefined,
  gallery: (string | GalleryItemObject)[] | undefined,
  fallback: string = DEFAULT_PORTFOLIO_FALLBACK
): string {
  if (cover) return cover;
  if (Array.isArray(gallery) && gallery.length > 0) {
    const first = gallery[0];
    if (typeof first === "string" && first) return first;
    if (first && typeof first === "object" && "url" in first && first.url) {
      return first.url;
    }
  }
  return fallback;
}

/**
 * Kiểm tra đối tượng đầu vào đã là ProjectItem (camelCase) hay Project (snake_case từ API).
 */
function isProjectItem(item: Project | ProjectItem): item is ProjectItem {
  return "categoryId" in item && "src" in item && !("cover_image" in item);
}

/**
 * Chuyển đổi Project (snake_case từ API) hoặc chuẩn hóa ProjectItem về đúng cấu trúc ProjectItem nội bộ.
 */
export function toProjectItem(item: Project | ProjectItem): ProjectItem {
  if (isProjectItem(item)) {
    return item;
  }

  const tags = Array.isArray(item.style_tags) ? item.style_tags : [];
  const gallery = Array.isArray(item.gallery) ? item.gallery : [];

  return {
    id: String(item.id),
    title: item.title ?? "Dự án mới",
    categoryId: item.category_id ?? tags[0] ?? "piwedding",
    tag: item.tag ?? tags[1] ?? tags[0] ?? "Gia Tiên",
    location: item.location ?? "Tư gia, Đà Nẵng",
    src: item.cover_image ?? SAMPLE_STOCK_IMAGES[0],
    gallery,
    description: item.description ?? "",
    date: item.wedding_date ? String(item.wedding_date).split("T")[0] : "",
    budget: item.budget ?? "Thỏa thuận",
    status:
      (item.status as "active" | "featured" | "draft") ??
      (item.published === false ? "draft" : "active"),
    priceTier: (item.price_tier as "standard" | "premium") || "standard",
    createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
    venue_id: item.venue_id ?? undefined,
  };
}

/**
 * Chuyển đổi Project (snake_case từ API) sang CategoryPortfolioItem dùng cho Lookbook, ServicesSection và VenuePopupCard.
 */
export function toCategoryPortfolioItem(
  project: Project,
  venueOverride?: { name?: string | null; city?: string | null }
): CategoryPortfolioItem {
  const styleTags = Array.isArray(project.style_tags) ? project.style_tags : [];
  let galleryList: (string | GalleryItemObject)[] = [];

  if (Array.isArray(project.gallery) && project.gallery.length > 0) {
    galleryList = project.gallery;
  } else if (project.cover_image) {
    galleryList = [project.cover_image];
  }

  const location = venueOverride?.name
    ? `${venueOverride.name}${venueOverride.city ? ` · ${venueOverride.city}` : ""}`
    : project.location || "Đà Nẵng";

  return {
    id: String(project.id),
    categoryId: project.category_id || styleTags[0] || "piwedding",
    tag: project.tag || styleTags[1] || styleTags[0] || "Gia Tiên",
    title: project.title || "Dự án mới",
    location,
    src: resolveProjectCover(project.cover_image, galleryList),
    gallery: galleryList,
    priceTier: (project.price_tier as "standard" | "premium") || "standard",
    featured: project.status === "featured",
    status: project.status || "active",
  };
}

/**
 * Tách danh sách URL và cấu hình span từ mảng gallery hỗn hợp (string | GalleryItemObject).
 */
export function extractGalleryState(gallery: (string | GalleryItemObject)[] | undefined): {
  urls: string[];
  spans: Record<number, string>;
} {
  if (!Array.isArray(gallery)) {
    return { urls: [], spans: {} };
  }

  const urls: string[] = [];
  const spans: Record<number, string> = {};

  gallery.slice(0, 10).forEach((item, idx) => {
    if (typeof item === "string") {
      if (item) urls.push(item);
    } else if (item && typeof item === "object") {
      if (item.url) urls.push(item.url);
      if (item.span) spans[idx] = item.span;
    }
  });

  return { urls, spans };
}

/**
 * Chuẩn hóa mảng gallery hỗn hợp thành mảng URL thuần (dùng cho ProjectPayload đơn giản).
 */
export function extractGalleryUrls(gallery: (string | GalleryItemObject)[] | undefined): string[] {
  return extractGalleryState(gallery).urls;
}
