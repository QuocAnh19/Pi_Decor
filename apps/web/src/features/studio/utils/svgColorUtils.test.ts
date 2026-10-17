import { describe, it, expect } from "vitest";
import {
  hexToHSL,
  hslToHex,
  deriveShadowColor,
  deriveHighlightColor,
  swapSVGColors,
  extractSVGColors,
  buildCurtainCSSVars,
  buildTintFilter,
  buildMultiplyFilter,
  recolorSVGString,
} from "./svgColorUtils";

describe("svgColorUtils - Recolor & Filter logic", () => {
  it("chuyển đổi chính xác qua lại giữa hex và HSL", () => {
    const redHsl = hexToHSL("#FF0000");
    expect(redHsl).toEqual({ h: 0, s: 100, l: 50 });

    const redHex = hslToHex(0, 100, 50);
    expect(redHex.toUpperCase()).toBe("#FF0000");
  });

  it("tạo đúng màu shadow và highlight từ màu gốc", () => {
    const base = "#E7B6BB";
    const shadow = deriveShadowColor(base);
    const highlight = deriveHighlightColor(base);

    expect(shadow).toMatch(/^#[0-9a-f]{6}$/i);
    expect(highlight).toMatch(/^#[0-9a-f]{6}$/i);
    expect(shadow).not.toBe(base);
    expect(highlight).not.toBe(base);
  });

  it("trích xuất màu và thay thế màu bằng colorMap", () => {
    const svg = `<svg><path fill="#ff0000" stroke="#00ff00"/><stop stop-color="#0000ff"/></svg>`;
    const colors = extractSVGColors(svg);
    expect(colors).toContain("#ff0000");
    expect(colors).toContain("#00ff00");
    expect(colors).toContain("#0000ff");

    const swapped = swapSVGColors(svg, {
      "#ff0000": "#111111",
      "#00ff00": "#222222",
    });
    expect(swapped).toContain('fill="#111111"');
    expect(swapped).toContain('stroke="#222222"');
    expect(swapped).toContain('stop-color="#0000ff"');
  });

  it("tạo chuỗi CSS vars cho rèm", () => {
    const vars = buildCurtainCSSVars("#D4AF37");
    expect(vars).toContain("--curtain-main:#D4AF37");
    expect(vars).toContain("--curtain-shadow:");
    expect(vars).toContain("--curtain-highlight:");
  });

  it("tạo bộ lọc tint và multiply hợp lệ với SVG filter", () => {
    const tintFilter = buildTintFilter("#991B1B", "filter-tint-1");
    expect(tintFilter).toContain('id="filter-tint-1"');
    expect(tintFilter).toContain('flood-color="#991B1B"');

    const multiplyFilter = buildMultiplyFilter("#991B1B", "filter-mult-1");
    expect(multiplyFilter).toContain('id="filter-mult-1"');
    expect(multiplyFilter).toContain('mode="multiply"');
  });

  it("recolorSVGString đổi màu các thuộc tính fill, stroke và stop-color", () => {
    const svg = `<svg><rect fill="#888888" stroke="#444444"/><stop stop-color="#cccccc"/></svg>`;
    const recolored = recolorSVGString(svg, "#991B1B");

    expect(recolored).not.toContain('fill="#888888"');
    expect(recolored).not.toContain('stroke="#444444"');
    expect(recolored).toContain("fill=");
    expect(recolored).toContain("stroke=");
    expect(recolored).toContain("stop-color=");
  });
});
