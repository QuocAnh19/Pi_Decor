/**
 * Cấu hình thông tin thương hiệu & siêu dữ liệu SEO cho Pi Decor.
 * Các trường thông tin doanh nghiệp (địa chỉ, SĐT, giờ mở cửa) chưa có quyết định
 * chính thức từ ban quản trị nên ĐỂ TRỐNG hoặc đặt TODO, tuyệt đối KHÔNG tự bịa.
 */
export const siteConfig = {
  name: "Pi Decor",
  siteUrl: "https://pidecor.vn",
  defaultOgImage: "/images/hero.webp",
  description:
    "Dịch vụ thiết kế và trang trí tiệc cưới, sự kiện chuyên nghiệp với phong cách tinh tế, cá nhân hóa từng không gian.",

  // Thông tin doanh nghiệp (LocalBusiness Schema)
  business: {
    legalName: "Pi Decor",
    telephone: "", // TODO: Bổ sung số điện thoại chính thức của doanh nghiệp
    email: "", // TODO: Bổ sung email chính thức của doanh nghiệp
    address: {
      streetAddress: "", // TODO: Bổ sung địa chỉ đường phố chính thức
      addressLocality: "Hồ Chí Minh",
      addressRegion: "TP. Hồ Chí Minh",
      postalCode: "", // TODO: Bổ sung mã bưu chính
      addressCountry: "VN",
    },
    geo: {
      latitude: "", // TODO: Bổ sung tọa độ trụ sở chính
      longitude: "", // TODO: Bổ sung tọa độ trụ sở chính
    },
    openingHours: "", // TODO: Bổ sung khung giờ mở cửa chính thức (ví dụ: Mo-Su 08:00-20:00)
    priceRange: "$$",
  },
};

/**
 * Tạo đối tượng JSON-LD schema dạng LocalBusiness dựa trên siteConfig.
 * Chỉ xuất các trường có dữ liệu hợp lệ, không xuất các trường trống để đảm bảo chuẩn SEO.
 */
export function generateLocalBusinessSchema(): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    description: siteConfig.description,
    image: `${siteConfig.siteUrl}${siteConfig.defaultOgImage}`,
    priceRange: siteConfig.business.priceRange,
  };

  if (siteConfig.business.telephone) {
    schema.telephone = siteConfig.business.telephone;
  }
  if (siteConfig.business.email) {
    schema.email = siteConfig.business.email;
  }
  if (siteConfig.business.openingHours) {
    schema.openingHours = siteConfig.business.openingHours;
  }

  const { streetAddress, addressLocality, addressRegion, addressCountry, postalCode } =
    siteConfig.business.address;
  if (streetAddress || addressLocality) {
    schema.address = {
      "@type": "PostalAddress",
      ...(streetAddress ? { streetAddress } : {}),
      ...(addressLocality ? { addressLocality } : {}),
      ...(addressRegion ? { addressRegion } : {}),
      ...(postalCode ? { postalCode } : {}),
      ...(addressCountry ? { addressCountry } : {}),
    };
  }

  const { latitude, longitude } = siteConfig.business.geo;
  if (latitude && longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    };
  }

  return schema;
}
