import { describe, expect, it } from "vitest";

import type { WireShape } from "@/entities/wireframe/wireframe.types";
import {
  boundsContain,
  getAlignmentGuides,
  getGuideCandidates,
  getShapeBounds,
} from "@/features/editor/wireframe/alignment-guides";

function makeShape(overrides: Partial<WireShape> & Pick<WireShape, "id" | "type" | "x" | "y" | "width" | "height">): WireShape {
  return {
    name: overrides.id,
    text: "",
    locked: false,
    visible: true,
    layer: 0,
    style: {
      fill: "#fff",
      stroke: "#000",
      strokeWidth: 1,
      strokeStyle: "solid",
      strokeOpacity: 1,
      textColor: "#000",
      fontSize: 14,
      fontFamily: "sans-serif",
      fontWeight: 400,
      textAlign: "center",
      opacity: 1,
      rotation: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0,
      shadow: { x: 0, y: 0, blur: 0, spread: 0, color: "transparent" },
    },
    ...overrides,
  };
}

describe("boundsContain", () => {
  it("detects when bounds fit inside a frame", () => {
    const frame = makeShape({ id: "frame", type: "desktop", x: 0, y: 0, width: 400, height: 300 });
    expect(boundsContain(frame, { x: 50, y: 50, width: 100, height: 80 })).toBe(true);
    expect(boundsContain(frame, { x: 350, y: 50, width: 100, height: 80 })).toBe(false);
  });
});

describe("getShapeBounds", () => {
  it("returns bounding box for multiple shapes", () => {
    const shapes = [
      makeShape({ id: "a", type: "rect", x: 10, y: 20, width: 50, height: 30 }),
      makeShape({ id: "b", type: "rect", x: 80, y: 40, width: 20, height: 60 }),
    ];
    expect(getShapeBounds(shapes)).toEqual({ x: 10, y: 20, width: 90, height: 80 });
  });
});

describe("getGuideCandidates", () => {
  it("prefers shapes inside the active frame", () => {
    const frame = makeShape({ id: "frame", type: "mobile", x: 0, y: 0, width: 300, height: 600 });
    const inside = makeShape({ id: "inside", type: "rect", x: 20, y: 20, width: 40, height: 40 });
    const outside = makeShape({ id: "outside", type: "rect", x: 400, y: 20, width: 40, height: 40 });
    const candidates = getGuideCandidates([frame, inside, outside], new Set(["moving"]), {
      x: 30,
      y: 30,
      width: 60,
      height: 60,
    });
    expect(candidates.map((shape) => shape.id)).toEqual(["inside"]);
  });
});

describe("getAlignmentGuides", () => {
  it("snaps to nearby center alignment", () => {
    const target = makeShape({ id: "target", type: "rect", x: 100, y: 100, width: 40, height: 40 });
    const guides = getAlignmentGuides([target], new Set(["moving"]), {
      x: 110,
      y: 110,
      width: 20,
      height: 20,
    });
    expect(guides).toContainEqual({ orientation: "vertical", position: 120 });
    expect(guides).toContainEqual({ orientation: "horizontal", position: 120 });
  });
});
