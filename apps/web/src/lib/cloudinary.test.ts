import { describe, it, expect } from "vitest";
import { cloudinaryUrl } from "./cloudinary";

describe("cloudinaryUrl helper", () => {
  it("trả về chuỗi rỗng khi url là null, undefined hoặc rỗng", () => {
    expect(cloudinaryUrl(null)).toBe("");
    expect(cloudinaryUrl(undefined)).toBe("");
    expect(cloudinaryUrl("")).toBe("");
  });

  it("trả về nguyên bản đối với URL không phải Cloudinary hoặc ảnh cục bộ", () => {
    expect(cloudinaryUrl("/images/hero.webp")).toBe("/images/hero.webp");
    expect(cloudinaryUrl("https://example.com/photo.jpg")).toBe("https://example.com/photo.jpg");
    expect(cloudinaryUrl("/uploads/local-image.png")).toBe("/uploads/local-image.png");
  });

  it("thêm f_auto,q_auto khi không truyền options", () => {
    const input = "https://res.cloudinary.com/pidecor/image/upload/v123456/sample.jpg";
    const expected =
      "https://res.cloudinary.com/pidecor/image/upload/f_auto,q_auto/v123456/sample.jpg";
    expect(cloudinaryUrl(input)).toBe(expected);
  });

  it("thêm w_<width>,c_limit và f_auto,q_auto khi truyền width", () => {
    const input = "https://res.cloudinary.com/pidecor/image/upload/v123456/sample.jpg";
    const expected =
      "https://res.cloudinary.com/pidecor/image/upload/f_auto,q_auto,w_600,c_limit/v123456/sample.jpg";
    expect(cloudinaryUrl(input, { width: 600 })).toBe(expected);
  });

  it("hỗ trợ tùy biến quality số và quality auto", () => {
    const input = "https://res.cloudinary.com/pidecor/image/upload/sample.jpg";
    const expectedCustomQuality =
      "https://res.cloudinary.com/pidecor/image/upload/f_auto,q_80,w_1200,c_limit/sample.jpg";
    expect(cloudinaryUrl(input, { width: 1200, quality: 80 })).toBe(expectedCustomQuality);

    const expectedAutoQuality =
      "https://res.cloudinary.com/pidecor/image/upload/f_auto,q_auto,w_800,c_limit/sample.jpg";
    expect(cloudinaryUrl(input, { width: 800, quality: "auto" })).toBe(expectedAutoQuality);
  });

  it("thay thế transformation cũ nếu URL đã có sẵn transformation", () => {
    const input = "https://res.cloudinary.com/pidecor/image/upload/w_200/v123456/sample.jpg";
    const expected =
      "https://res.cloudinary.com/pidecor/image/upload/f_auto,q_auto,w_800,c_limit/v123456/sample.jpg";
    expect(cloudinaryUrl(input, { width: 800 })).toBe(expected);
  });
});
