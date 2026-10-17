/**
 * Hàm hỗ trợ lấy chuỗi đã trim hoặc undefined nếu rỗng.
 */
function getEnvString(val: unknown): string | undefined {
  if (typeof val !== "string") return undefined;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const env =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : ({} as Record<string, string | undefined>);

const businessName = getEnvString(env.VITE_BUSINESS_NAME) ?? "Pi Decor";
const businessTelephone = getEnvString(env.VITE_BUSINESS_TELEPHONE);
const businessEmail = getEnvString(env.VITE_BUSINESS_EMAIL);
const streetAddress = getEnvString(env.VITE_BUSINESS_STREET_ADDRESS);
const addressLocality = getEnvString(env.VITE_BUSINESS_LOCALITY);
const addressRegion = getEnvString(env.VITE_BUSINESS_REGION);
const postalCode = getEnvString(env.VITE_BUSINESS_POSTAL_CODE);
const addressCountry =
  getEnvString(env.VITE_BUSINESS_COUNTRY) ?? (streetAddress || addressLocality ? "VN" : undefined);
const latitude = getEnvString(env.VITE_BUSINESS_LATITUDE);
const longitude = getEnvString(env.VITE_BUSINESS_LONGITUDE);
const openingHours = getEnvString(env.VITE_BUSINESS_OPENING_HOURS);
const dataProtectionEmail = getEnvString(env.VITE_BUSINESS_DATA_PROTECTION_EMAIL);

const retentionDaysParsed = parseInt(getEnvString(env.VITE_RETENTION_DAYS) ?? "", 10);
const retentionDays =
  !isNaN(retentionDaysParsed) && retentionDaysParsed > 0 ? retentionDaysParsed : undefined;

const isPrivacyReviewed = getEnvString(env.VITE_PRIVACY_POLICY_REVIEWED)?.toLowerCase() === "true";

/**
 * Cấu hình thông tin thương hiệu & siêu dữ liệu SEO cho Pi Decor.
 * Đọc trực tiếp từ biến môi trường VITE_BUSINESS_*. Trường nào trống sẽ có giá trị undefined.
 */
export const siteConfig = {
  name: businessName,
  siteUrl: "https://pidecor.vn",
  defaultOgImage: "/images/hero.webp",
  description:
    "Dịch vụ thiết kế và trang trí tiệc cưới, sự kiện chuyên nghiệp với phong cách tinh tế, cá nhân hóa từng không gian.",

  // Thông tin doanh nghiệp (LocalBusiness Schema)
  business: {
    legalName: businessName,
    telephone: businessTelephone,
    email: businessEmail,
    address: {
      streetAddress,
      addressLocality,
      addressRegion,
      postalCode,
      addressCountry,
    },
    geo: {
      latitude,
      longitude,
    },
    openingHours,
    dataProtectionEmail,
    priceRange: "$$",
  },

  retentionDays,
  isPrivacyReviewed,
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

  const {
    streetAddress: street,
    addressLocality: locality,
    addressRegion: region,
    addressCountry: country,
    postalCode: post,
  } = siteConfig.business.address;
  if (street || locality || region || post) {
    schema.address = {
      "@type": "PostalAddress",
      ...(street ? { streetAddress: street } : {}),
      ...(locality ? { addressLocality: locality } : {}),
      ...(region ? { addressRegion: region } : {}),
      ...(post ? { postalCode: post } : {}),
      ...(country ? { addressCountry: country } : {}),
    };
  }

  const { latitude: lat, longitude: lng } = siteConfig.business.geo;
  if (lat && lng) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: lat,
      longitude: lng,
    };
  }

  return schema;
}
