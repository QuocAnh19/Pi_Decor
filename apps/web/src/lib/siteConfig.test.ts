import { describe, it, expect } from "vitest";
import { siteConfig, generateLocalBusinessSchema } from "./siteConfig";

describe("siteConfig & LocalBusiness JSON-LD", () => {
  it("ẩn các trường trống khỏi siteConfig và không gán chuỗi rỗng", () => {
    // Khi các biến môi trường để trống, các trường tương ứng phải là undefined
    if (!import.meta.env.VITE_BUSINESS_TELEPHONE) {
      expect(siteConfig.business.telephone).toBeUndefined();
    }
    if (!import.meta.env.VITE_BUSINESS_EMAIL) {
      expect(siteConfig.business.email).toBeUndefined();
    }
    if (!import.meta.env.VITE_BUSINESS_STREET_ADDRESS) {
      expect(siteConfig.business.address.streetAddress).toBeUndefined();
    }
  });

  it("generateLocalBusinessSchema trả về JSON-LD hợp lệ, parse được và không có chuỗi rỗng", () => {
    const schema = generateLocalBusinessSchema();

    // Phải tuần tự hóa và parse JSON hợp lệ
    const jsonString = JSON.stringify(schema);
    const parsed = JSON.parse(jsonString);

    expect(parsed).toBeDefined();
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("LocalBusiness");
    expect(parsed.name).toBe(siteConfig.name);

    // Tuyệt đối không chứa chuỗi rỗng "" ở bất kỳ trường nào trong schema
    function assertNoEmptyStrings(obj: unknown, path = "root") {
      if (typeof obj === "string") {
        expect(obj.trim().length, `Trường '${path}' không được là chuỗi rỗng`).toBeGreaterThan(0);
      } else if (obj && typeof obj === "object") {
        for (const [key, val] of Object.entries(obj)) {
          assertNoEmptyStrings(val, `${path}.${key}`);
        }
      }
    }

    assertNoEmptyStrings(parsed);
  });
});
