import type { HeroMedia } from "./types";

/**
 * Real-photo slots for the home page. Every `src` here is a path relative to
 * `/public` — drop the matching file into `public/images/` (create the
 * folder if it doesn't exist yet) and it appears automatically, no code
 * changes needed. Until then, MediaSlot shows a labeled placeholder.
 *
 * hero: 1 photo or short looping video, ngang (landscape), warm/ấm sáng,
 *       Pi Decor thật đang setup hoặc tiệc đã hoàn thiện — đây là ảnh đầu
 *       tiên khách thấy nên chọn ảnh mạnh nhất.
 */
export const heroMedia: HeroMedia = {
  src: "/images/hero.jpg", // or "/images/hero.mp4" for a looping video hero
  alt: "Không gian tiệc cưới Pi Decor",
};

// Small polaroid collage layered over the hero photo (Swan Agency-style
// overlapping frames). Two portrait (4:5) photos is enough — more starts to
// compete with the main hero image instead of supporting it.
export const heroCollageMedia: HeroMedia[] = [
  { src: "/images/hero-collage-1.jpg", alt: "Khoảnh khắc cô dâu chú rể" },
  { src: "/images/hero-collage-2.jpg", alt: "Chi tiết decor bàn tiệc" },
];
