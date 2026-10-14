import { describe, expect, it } from "vitest";

import { linearGradientCss, linearGradientSvgEndpoints, shapeFillBackground } from "@/entities/wireframe/fill-gradient";
import { makeShape, normalizeStyle } from "@/entities/wireframe/shape-factory";
import { buildWireframeSvg } from "@/features/export/export-actions";

describe("wireframe fill gradient", () => {
  it("keeps a solid fill when the gradient is absent or disabled", () => {
    const shape = makeShape("rect");
    expect(shape.style.fillGradient).toBeUndefined();
    expect(shapeFillBackground(shape)).toBe(shape.style.fill);

    shape.style.fillGradient = { enabled: false, from: "#111111", to: "#eeeeee", angle: 90 };
    expect(shapeFillBackground(shape)).toBe(shape.style.fill);
  });

  it("paints a linear gradient on filled shapes and never on text", () => {
    const button = makeShape("button");
    button.style.fillGradient = { enabled: true, from: "#2563eb", to: "#93c5fd", angle: 90 };
    expect(shapeFillBackground(button)).toBe(linearGradientCss(button.style.fillGradient));

    const text = makeShape("text");
    text.style.fill = "transparent";
    text.style.fillGradient = { enabled: true, from: "#ff0000", to: "#00ff00", angle: 45 };
    expect(shapeFillBackground(text)).toBe("transparent");
  });

  it("keeps icon glyphs transparent until a gradient background is enabled", () => {
    const icon = makeShape("icon");
    expect(shapeFillBackground(icon)).toBe("transparent");
    icon.style.fillGradient = { enabled: true, from: "#0f172a", to: "#38bdf8", angle: 180 };
    expect(shapeFillBackground(icon)).toBe("linear-gradient(180deg, #0f172a, #38bdf8)");
  });

  it("does not invent a gradient while normalizing older styles", () => {
    const style = normalizeStyle({ fill: "#abcdef" });
    expect(style.fill).toBe("#abcdef");
    expect("fillGradient" in style).toBe(false);

    const disabled = normalizeStyle({
      fillGradient: { enabled: false, from: "#111111", to: "#222222", angle: 12 },
    });
    expect(disabled.fillGradient).toEqual({ enabled: false, from: "#111111", to: "#222222", angle: 12 });
  });

  it("maps a horizontal CSS angle onto the shape width", () => {
    expect(linearGradientSvgEndpoints(90, 200, 80)).toEqual({ x1: 0, y1: 0.5, x2: 1, y2: 0.5 });
  });

  it("exports the gradient in SVG and leaves text on a solid fill", () => {
    const card = makeShape("card");
    card.id = "card-1";
    card.style.fillGradient = { enabled: true, from: "#111111", to: "#eeeeee", angle: 90 };
    const text = makeShape("text");
    text.id = "label-1";
    text.style.fill = "transparent";
    text.style.fillGradient = { enabled: true, from: "#ff0000", to: "#00ff00", angle: 0 };

    const svg = buildWireframeSvg([card, text]);
    expect(svg).toContain(`<linearGradient id="maketar-fill-card-1"`);
    expect(svg).toContain('stop-color="#111111"');
    expect(svg).toContain('fill="url(#maketar-fill-card-1)"');
    expect(svg).not.toContain("maketar-fill-label-1");
    expect(svg).toContain('fill="transparent"');
  });
});
