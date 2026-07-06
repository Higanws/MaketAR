import { describe, expect, it } from "vitest";

import {
  getFlowNodeFontSize,
  getFlowNodePadding,
  getFlowNodeTextScale,
  resolveFlowNodeDimensions,
} from "@/features/editor/flow/flow-node-text";

describe("resolveFlowNodeDimensions", () => {
  const defaults = { width: 160, height: 80 };

  it("prefers explicit width and height", () => {
    expect(resolveFlowNodeDimensions(200, 100, undefined, undefined, defaults)).toEqual({
      width: 200,
      height: 100,
    });
  });

  it("falls back to measured and style dimensions", () => {
    expect(
      resolveFlowNodeDimensions(undefined, undefined, { width: "180", height: "90" }, { width: 170, height: 85 }, defaults),
    ).toEqual({ width: 170, height: 85 });
  });

  it("uses defaults when nothing else is available", () => {
    expect(resolveFlowNodeDimensions(undefined, undefined, undefined, undefined, defaults)).toEqual(defaults);
  });
});

describe("getFlowNodeTextScale", () => {
  it("scales relative to default node size", () => {
    expect(getFlowNodeTextScale(160, 80, "process")).toBe(1);
    expect(getFlowNodeTextScale(80, 40, "process")).toBe(0.5);
  });
});

describe("getFlowNodeFontSize", () => {
  it("never goes below 8px", () => {
    expect(getFlowNodeFontSize("process", 0.1)).toBe(8);
  });

  it("uses variant-specific base sizes", () => {
    expect(getFlowNodeFontSize("text", 1)).toBe(14);
    expect(getFlowNodeFontSize("icon", 1)).toBe(11);
  });
});

describe("getFlowNodePadding", () => {
  it("scales padding with a minimum floor", () => {
    expect(getFlowNodePadding(1)).toEqual({
      paddingLeft: 12,
      paddingRight: 12,
      paddingTop: 8,
      paddingBottom: 8,
    });
    expect(getFlowNodePadding(0.1)).toEqual({
      paddingLeft: 4,
      paddingRight: 4,
      paddingTop: 2,
      paddingBottom: 2,
    });
  });
});
