import type {
  ServiceCategory,
  CategoryPortfolioItem,
  FabricSwatch,
  ToolCategory,
  Testimonial,
  LookbookItem,
  HeroMedia,
} from "./types";

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



/**
 * The 3 product lines Pi Decor actually operates (from the business card:
 * PiKIDS / PiWEDDING / PiEVENT). PiWedding stays "featured" — it's the
 * flagship line and the only one wired to the Interactive Studio — so it
 * takes the large bento slot; PiKids and PiEvent flank it as two smaller,
 * equally distinct "chấm phá" (accent daub) cards.
 */
export const serviceCategories: ServiceCategory[] = [
  {
    id: "piwedding",
    brand: "PiWedding",
    title: "Không gian cưới trong mơ",
    tagline: "Kiến tạo không gian — lưu giữ khoảnh khắc",
    description:
      "Từ lễ gia tiên ấm cúng đến sảnh tiệc lộng lẫy — tự tay phối vải, hoa, cổng cưới trên Studio trước khi chốt, hoặc để đội Pi Decor lo trọn gói.",
    icon: "Heart",
    accent: "wedding",
    items: ["Gia Tiên", "Nhà Hàng", "Ngoài Trời", "Nhà Rạp"],
    href: "/studio",
    ctaLabel: "Vào Studio thiết kế",
    featured: true,
    cover: "/images/service-piwedding.png",
  },
  {
    id: "pikids",
    brand: "PiKids",
    title: "Dấu mốc đầu đời",
    tagline: "Rực rỡ như tuổi thơ",
    description:
      "Đầy tháng, thôi nôi, sinh nhật và những buổi party nhỏ — decor ngọt ngào, đúng tông, đúng tuổi của con.",
    icon: "PartyPopper",
    accent: "kids",
    items: ["Đầy Tháng", "Thôi Nôi", "Sinh Nhật", "Party"],
    ctaLabel: "Liên hệ tư vấn",
    cover: "/images/service-pikids.png",
  },
  {
    id: "pievent",
    brand: "PiEvent",
    title: "Sự kiện & thương hiệu",
    tagline: "Chuyên nghiệp, đúng dấu ấn doanh nghiệp",
    description:
      "Khai trương, lễ Tết, sum up cuối năm, team building — set up nhanh gọn, hình ảnh chỉn chu cho mọi quy mô sự kiện.",
    icon: "Building2",
    accent: "event",
    items: ["Khai Trương", "Lễ - Tết", "Sum Up", "Team Building"],
    ctaLabel: "Liên hệ tư vấn",
    cover: "/images/service-pievent.png",
  },
];

/**
 * "Các dự án đã làm" cho mỗi product line, gắn tag đúng theo từng hạng mục
 * con trong `serviceCategories[].items` — đây là dữ liệu nguồn cho modal
 * chi tiết mở ra khi bấm vào một thẻ dịch vụ (ServiceDetailModal). Ảnh
 * dùng chung cơ chế MediaSlot: chưa có ảnh thật thì hiện placeholder đúng
 * tên file cần export, thả ảnh vào `public/images/portfolio/` là lên ngay.
 */
export const categoryPortfolio: CategoryPortfolioItem[] = [
  // ── PiWedding ──────────────────────────────────────────────────────────
  {
    id: "pw-1",
    categoryId: "piwedding",
    tag: "Gia Tiên",
    title: "Lễ gia tiên tông sen hồng",
    location: "Tư gia, Đà Nẵng",
    src: "/images/portfolio/piwedding-gia-tien-1.jpg",
  },
  {
    id: "pw-2",
    categoryId: "piwedding",
    tag: "Gia Tiên",
    title: "Bàn thờ gia tiên cổ điển đỏ - vàng",
    location: "Tư gia, Hội An",
    src: "/images/portfolio/piwedding-gia-tien-2.jpg",
  },
  {
    id: "pw-3",
    categoryId: "piwedding",
    tag: "Nhà Hàng",
    title: "Sảnh tiệc champagne gold",
    location: "Furama Resort, Đà Nẵng",
    src: "/images/portfolio/piwedding-nha-hang-1.jpg",
  },
  {
    id: "pw-4",
    categoryId: "piwedding",
    tag: "Nhà Hàng",
    title: "Backdrop sân khấu classic ivory",
    location: "Khách sạn Mường Thanh",
    src: "/images/portfolio/piwedding-nha-hang-2.jpg",
  },
  {
    id: "pw-5",
    categoryId: "piwedding",
    tag: "Ngoài Trời",
    title: "Cổng hoa garden party bên biển",
    location: "Resort ven biển, Đà Nẵng",
    src: "/images/portfolio/piwedding-ngoai-troi-1.jpg",
  },
  {
    id: "pw-6",
    categoryId: "piwedding",
    tag: "Ngoài Trời",
    title: "Tiệc cưới sân vườn hoàng hôn",
    location: "Sân vườn tư gia, Huế",
    src: "/images/portfolio/piwedding-ngoai-troi-2.jpg",
  },
  {
    id: "pw-7",
    categoryId: "piwedding",
    tag: "Nhà Rạp",
    title: "Nhà rạp truyền thống mái ngói",
    location: "Tư gia, Quảng Nam",
    src: "/images/portfolio/piwedding-nha-rap-1.jpg",
  },
  {
    id: "pw-8",
    categoryId: "piwedding",
    tag: "Nhà Rạp",
    title: "Rạp cưới miền quê tông pastel",
    location: "Tư gia, Điện Bàn",
    src: "/images/portfolio/piwedding-nha-rap-2.jpg",
  },

  // ── PiKids ────────────────────────────────────────────────────────────
  {
    id: "pk-1",
    categoryId: "pikids",
    tag: "Đầy Tháng",
    title: "Đầy tháng bé Bống tông pastel",
    location: "Tư gia, Đà Nẵng",
    src: "/images/portfolio/pikids-day-thang-1.jpg",
  },
  {
    id: "pk-2",
    categoryId: "pikids",
    tag: "Đầy Tháng",
    title: "Mâm cúng Mụ đầy tháng cổ truyền",
    location: "Tư gia, Hội An",
    src: "/images/portfolio/pikids-day-thang-2.jpg",
  },
  {
    id: "pk-3",
    categoryId: "pikids",
    tag: "Thôi Nôi",
    title: "Thôi nôi bé Tôm chủ đề rừng xanh",
    location: "Nhà hàng tiệc, Hà Nội",
    src: "/images/portfolio/pikids-thoi-noi-1.jpg",
  },
  {
    id: "pk-4",
    categoryId: "pikids",
    tag: "Thôi Nôi",
    title: "Thôi nôi tông hồng phấn công chúa",
    location: "Tư gia, Đà Nẵng",
    src: "/images/portfolio/pikids-thoi-noi-2.jpg",
  },
  {
    id: "pk-5",
    categoryId: "pikids",
    tag: "Sinh Nhật",
    title: "Sinh nhật 5 tuổi chủ đề vũ trụ",
    location: "Tư gia, Đà Nẵng",
    src: "/images/portfolio/pikids-sinh-nhat-1.jpg",
  },
  {
    id: "pk-6",
    categoryId: "pikids",
    tag: "Party",
    title: "Baby shower tông kem bơ",
    location: "Cafe sân vườn, Đà Nẵng",
    src: "/images/portfolio/pikids-party-1.jpg",
  },

  // ── PiEvent ───────────────────────────────────────────────────────────
  {
    id: "pe-1",
    categoryId: "pievent",
    tag: "Khai Trương",
    title: "Khai trương showroom nội thất",
    location: "Đà Nẵng",
    src: "/images/portfolio/pievent-khai-truong-1.jpg",
  },
  {
    id: "pe-2",
    categoryId: "pievent",
    tag: "Khai Trương",
    title: "Lễ động thổ dự án bất động sản",
    location: "Quảng Nam",
    src: "/images/portfolio/pievent-khai-truong-2.jpg",
  },
  {
    id: "pe-3",
    categoryId: "pievent",
    tag: "Lễ - Tết",
    title: "Trang trí sảnh đón Tết doanh nghiệp",
    location: "Văn phòng công ty, Đà Nẵng",
    src: "/images/portfolio/pievent-le-tet-1.jpg",
  },
  {
    id: "pe-4",
    categoryId: "pievent",
    tag: "Sum Up",
    title: "Gala Year End Party 2025",
    location: "Trung tâm sự kiện, Đà Nẵng",
    src: "/images/portfolio/pievent-sum-up-1.jpg",
  },
  {
    id: "pe-5",
    categoryId: "pievent",
    tag: "Team Building",
    title: "Set up khu vực team building outdoor",
    location: "Resort ven biển, Đà Nẵng",
    src: "/images/portfolio/pievent-team-building-1.jpg",
  },
];

export const toolCategories: ToolCategory[] = [
  { id: "fabric", label: "Vải Voan", icon: "Ribbon" },
  { id: "flowers", label: "Cụm Hoa", icon: "Flower2" },
  { id: "arch", label: "Cổng Hoa", icon: "DoorOpen" },
];

export const fabricSwatches: FabricSwatch[] = [
  { id: "rose", label: "Hồng Phấn", hex: "#E7B6BB" },
  { id: "sage", label: "Rêu Nhạt", hex: "#AFC49C" },
  { id: "sand", label: "Vàng Cát", hex: "#C99F6F" },
  { id: "lavender", label: "Oải Hương", hex: "#B98AC9" },
  { id: "champagne", label: "Champagne", hex: "#E7BE79" },
  { id: "smoke", label: "Xanh Khói", hex: "#8A9BAE" },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Mình tự tay thử màu vải trước cả tuần, đến ngày cưới đúng y như hình dung.",
    author: "Thu Hà",
    role: "Cô dâu, TP.HCM · PiWedding",
  },
  {
    id: "t2",
    quote: "Đặt tiệc thôi nôi cho con mà vẫn chọn được đúng tông pastel mình thích, nhanh gọn.",
    author: "Minh & Anh",
    role: "Ba mẹ bé Tôm, Hà Nội · PiKids",
  },
  {
    id: "t3",
    quote: "Đội thi công dựng đúng 100% timeline sự kiện khai trương, không lệch một khâu nào.",
    author: "Ngọc Linh",
    role: "Quản lý thương hiệu, Đà Nẵng · PiEvent",
  },
];

// aspect-[4/5] cards — export photos ở khung dọc 4:5 (ví dụ 1600×2000px) để không bị crop lệch.
export const lookbookItems: LookbookItem[] = [
  { id: "l1", tag: "Sen Hồng", src: "/images/lookbook-sen-hong.jpg" },
  { id: "l2", tag: "Champagne Gold", src: "/images/lookbook-champagne-gold.jpg" },
  { id: "l3", tag: "Thôi Nôi Pastel", src: "/images/lookbook-thoi-noi-pastel.jpg" },
  { id: "l4", tag: "Classic Ivory", src: "/images/lookbook-classic-ivory.jpg" },
  { id: "l5", tag: "Khai Trương Rực Rỡ", src: "/images/lookbook-khai-truong.jpg" },
  { id: "l6", tag: "Garden Party", src: "/images/lookbook-garden-party.jpg" },
];
