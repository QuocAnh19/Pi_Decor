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
  src: "/images/hero.webp",
  srcSet: "/images/hero-800w.webp 800w, /images/hero-1600w.webp 1600w",
  width: 1600,
  height: 1067,
  alt: "Không gian tiệc cưới Pi Decor",
};

// Small polaroid collage layered over the hero photo (Swan Agency-style
// overlapping frames). Two portrait (4:5) photos is enough — more starts to
// compete with the main hero image instead of supporting it.
export const heroCollageMedia: HeroMedia[] = [
  {
    src: "/images/hero-collage-1.webp",
    srcSet: "/images/hero-collage-1-800w.webp 800w, /images/hero-collage-1-1600w.webp 1600w",
    width: 800,
    height: 534,
    alt: "Khoảnh khắc cô dâu chú rể",
  },
  {
    src: "/images/hero-collage-2.webp",
    srcSet: "/images/hero-collage-2-800w.webp 800w, /images/hero-collage-2.webp 1365w",
    width: 800,
    height: 1200,
    alt: "Chi tiết decor bàn tiệc",
  },
];
